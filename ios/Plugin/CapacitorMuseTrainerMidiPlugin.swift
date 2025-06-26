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
                                
                                // Add message-specific fields based on MIDI command data
                                // Use raw MIDI data bytes for compatibility across MIKMIDI versions
                                if let midiData = cmd.rawData, midiData.count >= 1 {
                                    let status = midiData[0]
                                    let command = (status & 0xF0) >> 4
                                    
                                    switch command {
                                    case 0x8, 0x9: // Note Off/On
                                        if midiData.count >= 3 {
                                            message["note"] = Int(midiData[1])
                                            message["velocity"] = Int(midiData[2])
                                        }
                                    case 0xA: // Polyphonic Pressure
                                        if midiData.count >= 3 {
                                            message["note"] = Int(midiData[1])
                                            message["pressure"] = Int(midiData[2])
                                        }
                                    case 0xB: // Control Change
                                        if midiData.count >= 3 {
                                            message["controller"] = Int(midiData[1])
                                            message["value"] = Int(midiData[2])
                                        }
                                    case 0xC: // Program Change
                                        if midiData.count >= 2 {
                                            message["program"] = Int(midiData[1])
                                        }
                                    case 0xD: // Channel Pressure
                                        if midiData.count >= 2 {
                                            message["pressure"] = Int(midiData[1])
                                        }
                                    case 0xE: // Pitch Bend
                                        if midiData.count >= 3 {
                                            let lsb = Int(midiData[1])
                                            let msb = Int(midiData[2])
                                            message["value"] = (msb << 7) | lsb
                                        }
                                    default:
                                        break
                                    }
                                } else if cmd.commandType == .systemExclusive {
                                    // For SysEx, include the full MIDI data
                                    if let midiData = cmd.rawData {
                                        message["data"] = midiData.map { Int($0) }
                                    }
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
