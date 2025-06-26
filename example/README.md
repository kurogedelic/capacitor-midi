# 🎵 Capacitor MIDI Test App

A comprehensive MIDI testing application built with Capacitor, designed to test and demonstrate the functionality of the `@kurogedelic/capacitor-midi` plugin.

## 🚀 Features

### 🔌 MIDI Device Management

- **Device Discovery**: List and monitor connected MIDI devices
- **Real-time Status**: Live connection status updates
- **Device Information**: Display device names, manufacturers, and types
- **WebMIDI Comparison**: Compare plugin results with native WebMIDI API

### 🎹 Virtual Keyboard

- **Interactive Piano**: 12-key virtual piano (C4-B4)
- **Note Visualization**: Visual feedback for pressed keys
- **MIDI Output**: Send Note On/Off messages to connected devices
- **Multi-touch Support**: Handle multiple simultaneous notes

### 🎛️ MIDI Controls

- **Control Change**: Send CC #7 (Volume) with random values
- **Program Change**: Send random program change messages
- **Pitch Bend**: Send 14-bit pitch bend data
- **SysEx**: Send System Exclusive messages (General MIDI Reset)

### 📊 Real-time Monitoring

- **Message Log**: Timestamped MIDI message display
- **Bidirectional Communication**: Monitor both sent and received messages
- **Message Parsing**: Detailed breakdown of MIDI message types:
  - Note On/Off (with note name conversion)
  - Control Change
  - Program Change
  - Pitch Bend
  - Channel/Polyphonic Pressure
  - System Exclusive

### 🔧 Debug Tools

- **WebMIDI Debug**: Comprehensive browser MIDI API analysis
- **Browser Compatibility**: Check WebMIDI API availability
- **Device Enumeration**: List all available inputs and outputs
- **Permission Status**: Monitor MIDI access permissions

## 🛠️ Technical Stack

- **Framework**: Capacitor 7.4.0
- **Platform**: iOS (with potential for Android/Web)
- **Language**: Vanilla JavaScript (ES6 Classes)
- **UI**: HTML5 + CSS3 (No framework dependencies)
- **MIDI Plugin**: `@kurogedelic/capacitor-midi`

## 📱 Platform Support

### iOS

- ✅ Core MIDI integration
- ✅ Bluetooth MIDI support
- ✅ USB MIDI device support
- ✅ Network MIDI support
- ✅ Background MIDI processing

### Web

- ✅ WebMIDI API fallback
- ✅ Browser-based MIDI access
- ✅ Cross-platform debugging

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- Xcode 14+ (for iOS development)
- iOS Simulator or physical iOS device
- MIDI device (optional, for testing)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd capacitor-midi-test-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Add iOS platform**

   ```bash
   npx cap add ios
   ```

4. **Build the project**

   ```bash
   npm run build
   npx cap sync
   ```

5. **Open in Xcode**

   ```bash
   npx cap open ios
   ```

6. **Run on device/simulator**
   - Select target device in Xcode
   - Press Cmd+R to build and run

### Testing with MIDI Devices

1. **Connect a MIDI device**
   - USB MIDI interface
   - Bluetooth MIDI keyboard
   - Network MIDI device
   - Virtual MIDI device

2. **Grant permissions**
   - Allow Bluetooth access when prompted
   - Accept MIDI device connections

3. **Test functionality**
   - Click "List MIDI Devices" to discover devices
   - Use virtual keyboard to send notes
   - Monitor incoming MIDI messages in the log

## 🎯 Usage Examples

### Basic Device Discovery

```javascript
// List all available MIDI devices
const result = await CapacitorMidi.listDevices();
console.log('Found devices:', result.devices);
```

### Sending MIDI Messages

```javascript
// Send a Note On message
await CapacitorMidi.sendCommand({
  command: [0x90, 60, 100], // Note On, Middle C, Velocity 100
  timestamp: Date.now(),
});
```

### Receiving MIDI Messages

```javascript
// Listen for incoming MIDI messages
CapacitorMidi.addListener('commandReceive', event => {
  console.log('Received:', event.message);
  console.log('From device:', event.deviceId);
});
```

## 🔍 Troubleshooting

### Common Issues

**No devices detected**

- Ensure MIDI device is properly connected
- Check device compatibility with iOS Core MIDI
- Restart the app to refresh device list

**Permission denied**

- Check iOS Settings > Privacy > Bluetooth
- Ensure app has Bluetooth permissions
- Try reinstalling the app

**WebMIDI not working**

- Use HTTPS for web deployment
- Enable WebMIDI in browser settings
- Check browser compatibility

### Debug Information

Use the "Debug WebMIDI" button to get detailed information about:

- Browser MIDI API support
- Available MIDI devices
- Permission status
- System configuration

## 📋 MIDI Message Types Supported

| Type                | Description            | Status |
| ------------------- | ---------------------- | ------ |
| Note On/Off         | Musical note messages  | ✅     |
| Control Change      | Continuous controllers | ✅     |
| Program Change      | Instrument selection   | ✅     |
| Pitch Bend          | Pitch wheel data       | ✅     |
| Channel Pressure    | Aftertouch             | ✅     |
| Polyphonic Pressure | Per-note aftertouch    | ✅     |
| System Exclusive    | Device-specific data   | ✅     |
| Clock/Transport     | MIDI timing            | 🔄     |

## 🧪 Testing Scenarios

### Manual Testing

1. **Device Connection**: Connect/disconnect MIDI devices
2. **Note Input**: Play notes on external keyboard
3. **Control Input**: Move knobs/faders on MIDI controller
4. **Virtual Keyboard**: Test app's note output
5. **MIDI Controls**: Test CC, Program Change, Pitch Bend

### Automated Testing

- Device enumeration accuracy
- Message parsing correctness
- Latency measurements
- Memory usage monitoring

## 🤝 Contributing

This project serves as a test bed for the `@kurogedelic/capacitor-midi` plugin. Contributions are welcome!

### Areas for Improvement

- Android platform support
- Additional MIDI message types
- Latency optimization
- UI/UX enhancements
- Performance monitoring

## 📝 License

MIT License - see LICENSE file for details

## 👤 Author

**Leo Kuroshita @ kurogedelic**

- GitHub: [@kurogedelic](https://github.com/kurogedelic)
- Plugin: [@kurogedelic/capacitor-midi](https://github.com/kurogedelic/capacitor-midi)

## 🙏 Acknowledgments

- Capacitor team for the excellent cross-platform framework
- MIKMIDI library for robust iOS MIDI support
- WebMIDI API specification contributors
- MIDI device manufacturers for protocol documentation

---

_Built with ❤️ for the MIDI community_
