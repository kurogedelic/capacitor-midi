# Capacitor MIDI Plugin Example

This example demonstrates how to use the `@kurogedelic/capacitor-midi` plugin in a web application.

## Features Demonstrated

- 🔌 **Device Management**: List and monitor MIDI devices
- 🎹 **Virtual Keyboard**: Interactive keyboard to send MIDI notes
- 🎛️ **MIDI Controls**: Send various MIDI messages (CC, Program Change, Pitch Bend, SysEx)
- 📊 **Real-time Logging**: Display incoming and outgoing MIDI messages
- 🎵 **Message Types**: Support for all MIDI 1.0 message types

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start development server**:

   ```bash
   npm run dev
   ```

3. **Open in browser**: Navigate to http://localhost:3000

## Testing the Example

### Prerequisites

- **Chrome/Firefox/Edge**: Full WebMIDI API support
- **MIDI Device**: Connect a MIDI keyboard or use software like LoopMIDI (Windows) or IAC Driver (macOS)

### Basic Testing

1. **Connect MIDI Device**: Connect a USB MIDI keyboard or enable virtual MIDI ports
2. **List Devices**: Click "List MIDI Devices" to see available devices
3. **Play Virtual Keyboard**: Click the on-screen keys to send MIDI notes
4. **Test Controls**: Try the CC, Program Change, Pitch Bend, and SysEx buttons
5. **Monitor Messages**: Watch the log for incoming MIDI messages from your device

### Advanced Testing

1. **Device Hotplug**: Connect/disconnect MIDI devices while the app is running
2. **Multiple Devices**: Test with multiple MIDI inputs and outputs
3. **Real-time Performance**: Test latency with fast note sequences
4. **Message Types**: Send various MIDI message types to test parsing

### Safari Limitations

If using Safari, you may see limited functionality due to WebMIDI API restrictions:

- Permission prompts for MIDI access
- Limited SysEx support
- Timing precision issues

**Recommendation**: For iOS devices, use this plugin in a Capacitor app with native iOS implementation.

## Code Structure

```
example/
├── src/
│   └── main.ts          # Main example code
├── index.html           # HTML interface
├── package.json         # Dependencies
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

## Key Implementation Details

### Device Management

```typescript
// List available MIDI devices
const { devices } = await CapacitorMidi.listDevices();

// Listen for device changes
CapacitorMidi.addListener('deviceChange', event => {
  console.log(`Device ${event.state}: ${event.device.name}`);
});
```

### Sending MIDI Messages

```typescript
// Send Note On
await CapacitorMidi.sendCommand({
  command: [0x90, 60, 100], // Note On, Middle C, velocity 100
  timestamp: Date.now(),
});

// Send Control Change
await CapacitorMidi.sendCommand({
  command: [0xb0, 7, 64], // CC #7 (Volume), value 64
  timestamp: Date.now(),
});
```

### Receiving MIDI Messages

```typescript
CapacitorMidi.addListener('commandReceive', event => {
  const { message, deviceId } = event;

  switch (message.type) {
    case 'noteOn':
      console.log(`Note ON: ${message.note}, velocity: ${message.velocity}`);
      break;
    case 'controlChange':
      console.log(`CC ${message.controller}: ${message.value}`);
      break;
    // ... handle other message types
  }
});
```

## Browser Compatibility

| Browser      | Support Level | Notes              |
| ------------ | ------------- | ------------------ |
| Chrome 43+   | ✅ Full       | Recommended        |
| Firefox 108+ | ✅ Full       | Recommended        |
| Edge 79+     | ✅ Full       | Recommended        |
| Safari 14.1+ | ⚠️ Limited    | Use with caution   |
| iOS Safari   | ❌ None       | Use native iOS app |

## Troubleshooting

### No MIDI Devices Found

1. Ensure MIDI device is connected and powered on
2. Check if device appears in system MIDI settings
3. Try refreshing the page and listing devices again
4. On Windows, you may need to install device-specific drivers

### Permission Denied

1. Check browser permissions for MIDI access
2. Some browsers require HTTPS for WebMIDI API
3. Safari always prompts for permission

### Messages Not Received

1. Verify device is set to send MIDI data
2. Check if device is in the correct MIDI channel
3. Ensure the device is configured as a MIDI output

## Next Steps

- Integrate into a Capacitor app for iOS/Android support
- Add more sophisticated MIDI sequencing
- Implement MIDI file playback
- Add support for MIDI 2.0 features (future)

For more information, see the [main plugin documentation](../README.md).
