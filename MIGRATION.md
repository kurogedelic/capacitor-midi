# Migration Guide

## Migrating from `capacitor-musetrainer-midi` to `@kurogedelic/capacitor-midi`

This guide helps you migrate from the original `capacitor-musetrainer-midi` to the enhanced `@kurogedelic/capacitor-midi` fork.

## 🚀 Quick Migration

### 1. Update Package Installation

**Remove the old package:**

```bash
npm uninstall capacitor-musetrainer-midi
```

**Install the new package:**

```bash
npm install @kurogedelic/capacitor-midi
npx cap sync
```

### 2. Update Import Statements

**Before:**

```typescript
import { CapacitorMuseTrainerMidi } from 'capacitor-musetrainer-midi';
```

**After (Recommended):**

```typescript
import { CapacitorMidi } from '@kurogedelic/capacitor-midi';
```

**After (Backward Compatible):**

```typescript
import { CapacitorMuseTrainerMidi } from '@kurogedelic/capacitor-midi';
```

### 3. Update API Usage (Optional)

The new package provides enhanced TypeScript support. You can optionally update your code to use the improved type definitions:

**Before:**

```typescript
CapacitorMuseTrainerMidi.addListener('commandReceive', (args: any) => {
  // args is untyped
  console.log(args);
});
```

**After:**

```typescript
CapacitorMidi.addListener('commandReceive', event => {
  // event is fully typed
  const { message, deviceId } = event;

  switch (message.type) {
    case 'noteOn':
      console.log(`Note On: ${message.note}, velocity: ${message.velocity}`);
      break;
    case 'controlChange':
      console.log(`CC ${message.controller}: ${message.value}`);
      break;
    case 'sysex':
      console.log('SysEx:', message.data);
      break;
  }
});
```

## 📊 Enhanced Features

After migration, you gain access to:

### Improved Type Safety

```typescript
import type {
  MIDIMessage,
  MIDINoteMessage,
  MIDIControlChangeMessage,
} from '@kurogedelic/capacitor-midi';

// All MIDI message types are now properly defined
const handleMidiMessage = (message: MIDIMessage) => {
  // TypeScript knows all possible message types
};
```

### Enhanced Web Support

```typescript
// Now supports all MIDI message types on Web platform
CapacitorMidi.addListener('commandReceive', event => {
  const { message } = event;

  switch (message.type) {
    case 'noteOn':
    case 'noteOff':
    case 'controlChange': // ✅ Now supported on Web
    case 'programChange': // ✅ Now supported on Web
    case 'pitchBend': // ✅ Now supported on Web
    case 'channelPressure': // ✅ Now supported on Web
    case 'polyphonicPressure': // ✅ Now supported on Web
    case 'sysex': // ✅ Now supported on Web
      // Handle all message types
      break;
  }
});
```

### Better Device Information

```typescript
const { devices } = await CapacitorMidi.listDevices();

devices.forEach(device => {
  console.log({
    id: device.id, // ✅ Structured device ID
    name: device.name, // ✅ Device name
    manufacturer: device.manufacturer, // ✅ Manufacturer info
    type: device.type, // ✅ 'input' | 'output' | 'both'
    connected: device.connected, // ✅ Connection status
  });
});
```

## 🔄 Backward Compatibility

The new package maintains 100% backward compatibility:

- All existing function signatures work unchanged
- Event data structures remain compatible
- iOS native plugin name stays the same (`CapacitorMuseTrainerMidi`)
- No breaking changes to existing functionality

## 🛠️ Development Benefits

After migration, your development experience improves with:

- **Full TypeScript IntelliSense**: Auto-completion for all MIDI message types
- **Comprehensive Testing**: 26+ unit tests ensure reliability
- **Modern Build Tools**: Faster builds with latest tooling
- **Better Documentation**: Enhanced API documentation and examples

## 🚨 Potential Issues

### iOS Build Changes

If you encounter iOS build issues, update your Podfile:

```ruby
# In ios/App/Podfile, the pod name changes
pod 'CapacitorMidi', :path => '../../node_modules/@kurogedelic/capacitor-midi'
```

Then run:

```bash
cd ios && pod install && cd ..
```

### TypeScript Strict Mode

If using strict TypeScript settings, you may need to handle the improved type safety:

```typescript
// Before: This might have been allowed
const message: any = event.message;

// After: Use proper typing
const message = event.message;
if (message.type === 'noteOn') {
  // TypeScript knows this is a MIDINoteMessage
  console.log(message.note, message.velocity);
}
```

## 📞 Support

If you encounter any issues during migration:

1. Check the [GitHub Issues](https://github.com/kurogedelic/capacitor-midi/issues)
2. Review the [API Documentation](https://github.com/kurogedelic/capacitor-midi#api-documentation)
3. Open a new issue with your specific migration problem

## 🎯 Summary

The migration process is designed to be seamless:

1. **Replace package**: `npm uninstall capacitor-musetrainer-midi && npm install @kurogedelic/capacitor-midi`
2. **Update imports**: Change import statements (optional - backward compatible)
3. **Enjoy improvements**: Enhanced TypeScript support, better Web platform support, comprehensive testing

The enhanced fork provides significant improvements while maintaining complete compatibility with your existing code.
