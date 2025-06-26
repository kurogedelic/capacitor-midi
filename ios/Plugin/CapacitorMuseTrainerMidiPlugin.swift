import Foundation
import Capacitor
import MIKMIDI

@objc(CapacitorMuseTrainerMidiPlugin)
public class CapacitorMuseTrainerMidiPlugin: CAPPlugin {
    var midiDevicesObserver: NSKeyValueObservation?
    let deviceManager = MIKMIDIDeviceManager.shared
    
    func validDevice(dv: MIKMIDIDevice) -> Bool {
        !dv.isVirtual && dv.entities.count > 0 && !(dv.manufacturer ?? "").isEmpty
    }
    
    func alreadyConnected(_ sources: [MIKMIDISourceEndpoint], _ source: MIKMIDISourceEndpoint) -> Bool {
        for src in sources {
            if src == source {
                return true
            }
        }
        return false
    }
    
    func midiListen(_ dm: MIKMIDIDeviceManager) {
        self.listenForDevices(dm)
        self.listenForCommands(dm)
    }
    
    func listenForDevices(_ dm: MIKMIDIDeviceManager) {
        let devices = dm.availableDevices
            .filter(self.validDevice)
            .map({ device in
                return [
                    "id": String(device.uniqueID),
                    "name": device.displayName ?? "",
                    "manufacturer": device.manufacturer ?? "",
                    "type": "both",
                    "connected": true
                ]
            })
        for device in devices {
            self.notifyListeners("deviceChange", data: [
                "device": device,
                "state": "connected"
            ])
        }
    }
    
    func listenForCommands(_ dm: MIKMIDIDeviceManager) {
        for device in dm.availableDevices.filter(self.validDevice) {
            for entity in device.entities {
                for source in entity.sources {
                    if self.alreadyConnected(dm.connectedInputSources, source) {
                        continue
                    }
                    
                    do {
                        try self.deviceManager.connectInput(source, eventHandler: { (_, cmds) in
                            for cmd in cmds {
                                var cmdType: String
                                switch cmd.commandType {
                                case .noteOff:
                                    cmdType = "noteOff"
                                case .noteOn:
                                    cmdType = "noteOn"
                                case .polyphonicKeyPressure:
                                    cmdType = "polyphonicPressure"
                                case .controlChange:
                                    cmdType = "controlChange"
                                case .programChange:
                                    cmdType = "programChange"
                                case .channelPressure:
                                    cmdType = "channelPressure"
                                case .pitchWheelChange:
                                    cmdType = "pitchBend"
                                case .systemMessage:
                                    cmdType = "systemMessage"
                                case .systemExclusive:
                                    cmdType = "sysex"
                                case .systemTimecodeQuarterFrame:
                                    cmdType = "systemTimecodeQuarterFrame"
                                case .systemSongPositionPointer:
                                    cmdType = "systemSongPositionPointer"
                                case .systemSongSelect:
                                    cmdType = "systemSongSelect"
                                case .systemTuneRequest:
                                    cmdType = "systemTuneRequest"
                                case .systemTimingClock:
                                    cmdType = "systemTimingClock"
                                case .systemStartSequence:
                                    cmdType = "systemStartSequence"
                                case .systemContinueSequence:
                                    cmdType = "systemContinueSequence"
                                case .systemStopSequence:
                                    cmdType = "systemStopSequence"
                                case .systemKeepAlive:
                                    cmdType = "systemKeepAlive"
                                @unknown default:
                                    cmdType = "unknown"
                                }
                                
                                var message: [String: Any] = [
                                    "type": cmdType,
                                    "channel": (cmd as? MIKMIDIChannelVoiceCommand)?.channel ?? 0,
                                    "timestamp": Int(cmd.timestamp.timeIntervalSince1970 * 1000)
                                ]
                                
                                // Add message-specific fields
                                if let channelCmd = cmd as? MIKMIDIChannelVoiceCommand {
                                    switch cmd.commandType {
                                    case .noteOff, .noteOn:
                                        message["note"] = Int(channelCmd.note)
                                        message["velocity"] = Int(channelCmd.velocity)
                                    case .polyphonicKeyPressure:
                                        message["note"] = Int(channelCmd.note)
                                        message["pressure"] = Int(channelCmd.velocity)
                                    case .controlChange:
                                        if let ccCmd = cmd as? MIKMIDIControlChangeCommand {
                                            message["controller"] = Int(ccCmd.controllerNumber)
                                            message["value"] = Int(ccCmd.controllerValue)
                                        }
                                    case .programChange:
                                        if let pcCmd = cmd as? MIKMIDIProgramChangeCommand {
                                            message["program"] = Int(pcCmd.programNumber)
                                        }
                                    case .channelPressure:
                                        if let cpCmd = cmd as? MIKMIDIChannelPressureCommand {
                                            message["pressure"] = Int(cpCmd.pressure)
                                        }
                                    case .pitchWheelChange:
                                        if let pwCmd = cmd as? MIKMIDIPitchWheelChangeCommand {
                                            message["value"] = Int(pwCmd.pitchChange)
                                        }
                                    default:
                                        break
                                    }
                                } else if let sysexCmd = cmd as? MIKMIDISystemExclusiveCommand {
                                    message["data"] = sysexCmd.sysexData?.map { Int($0) } ?? []
                                }
                                
                                self.notifyListeners("commandReceive", data: [
                                    "message": message,
                                    "deviceId": String(source.entity?.device?.uniqueID ?? 0)
                                ])
                            }
                        })
                    } catch {
                        self.notifyListeners("connectError", data: [
                            "error": String(describing: error),
                            "deviceId": String(source.entity?.device?.uniqueID ?? 0)
                        ])
                    }
                }
            }
        }
    }
    
    override public func load() {
        midiDevicesObserver = deviceManager.observe(\.availableDevices) { (dm, _) in
            self.midiListen(dm)
        }
    }
    
    @objc func listDevices(_ call: CAPPluginCall) {
        let devices = deviceManager.availableDevices
            .filter(self.validDevice)
            .map({ device in
                return [
                    "id": String(device.uniqueID),
                    "name": device.displayName ?? "",
                    "manufacturer": device.manufacturer ?? "",
                    "type": "both",
                    "connected": true
                ]
            })
        call.resolve(["devices": devices])
    }
    
    @objc func sendCommand(_ call: CAPPluginCall) {
        let cmdArr = call.getArray("command") ?? []
        if cmdArr.isEmpty {
            call.reject("Invalid command")
            return
        }
        
        let cmd = cmdArr.map { UInt8( $0 as? Int ?? 0)}
        let ts = UInt64(truncatingIfNeeded: call.getInt("timestamp") ?? 0)
        let command = MIKMIDICommand.from(command: cmd, timestamp: ts)
        
        var err: Error?
        for device in deviceManager.availableDevices.filter(self.validDevice) {
            for entity in device.entities {
                for dest in entity.destinations {
                    do {
                        try deviceManager.send([command], to: dest)
                    } catch {
                        err = error
                    }
                }
            }
        }
        
        if let e = err {
            call.reject(e.localizedDescription)
        } else {
            call.resolve()
        }
    }
}
