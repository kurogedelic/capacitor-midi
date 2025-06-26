# Browser Support for WebMIDI API

This document provides detailed information about WebMIDI API support across different browsers and platforms.

## 🌐 WebMIDI API Compatibility

### Desktop Browsers

| Browser     | Version | Support Level          | Notes                                      |
| ----------- | ------- | ---------------------- | ------------------------------------------ |
| **Chrome**  | 43+     | ✅ **Full Support**    | Complete WebMIDI API implementation        |
| **Firefox** | 108+    | ✅ **Full Support**    | Complete support added in late 2022        |
| **Edge**    | 79+     | ✅ **Full Support**    | Chromium-based Edge has full support       |
| **Safari**  | 14.1+   | ⚠️ **Limited Support** | Requires user permission, some limitations |
| **Opera**   | 30+     | ✅ **Full Support**    | Based on Chromium                          |

### Mobile Browsers

| Browser              | Platform | Support Level       | Notes                         |
| -------------------- | -------- | ------------------- | ----------------------------- |
| **Chrome Mobile**    | Android  | ✅ **Full Support** | Same as desktop Chrome        |
| **Firefox Mobile**   | Android  | ✅ **Full Support** | Same as desktop Firefox       |
| **Safari Mobile**    | iOS      | ❌ **No Support**   | Use native iOS implementation |
| **Samsung Internet** | Android  | ✅ **Full Support** | Based on Chromium             |

## 🍎 Safari Limitations

### Current Safari Support (14.1+)

Safari has **partial** WebMIDI API support with several important limitations:

#### ✅ What Works

- Basic MIDI device enumeration
- Note On/Off messages
- Control Change messages
- Basic MIDI input/output

#### ❌ What Doesn't Work Well

- **User Permission Required**: Safari always prompts for MIDI access
- **Limited SysEx Support**: System Exclusive messages may not work reliably
- **Timing Issues**: Less precise timing compared to Chrome/Firefox
- **Device Reconnection**: May not handle device disconnection/reconnection well
- **Performance**: Generally slower MIDI processing

#### 🔧 Safari-Specific Code

```typescript
// Check for WebMIDI support before using
const checkWebMIDISupport = async () => {
  if (!navigator.requestMIDIAccess) {
    console.warn('WebMIDI API not supported in this browser');
    return false;
  }

  try {
    const access = await navigator.requestMIDIAccess({ sysex: false });
    return true;
  } catch (error) {
    console.warn('WebMIDI access denied or not available:', error);
    return false;
  }
};

// Use with caution in Safari
if (await checkWebMIDISupport()) {
  // Proceed with MIDI functionality
} else {
  // Show message about using iOS app for better MIDI support
}
```

## 📱 iOS Recommendation

For iOS devices, **avoid using WebMIDI** and use the native iOS implementation instead:

### Why Native iOS is Better

1. **Full CoreMIDI Integration**: Direct access to iOS CoreMIDI framework
2. **Better Performance**: No browser overhead, lower latency
3. **Reliable Device Handling**: Proper device connection/disconnection
4. **Complete MIDI Support**: All MIDI message types supported
5. **Background Processing**: Can handle MIDI in background (with proper app setup)

### iOS Implementation Example

```typescript
import { CapacitorMidi } from '@kurogedelic/capacitor-midi';
import { Capacitor } from '@capacitor/core';

// Detect platform and use appropriate implementation
if (Capacitor.getPlatform() === 'ios') {
  // Use native iOS implementation - full CoreMIDI support
  const devices = await CapacitorMidi.listDevices();

  CapacitorMidi.addListener('commandReceive', event => {
    // Reliable MIDI message handling on iOS
    console.log('MIDI message:', event.message);
  });
} else if (Capacitor.getPlatform() === 'web') {
  // Check WebMIDI support for web browsers
  if (await checkWebMIDISupport()) {
    // Use WebMIDI implementation
  } else {
    // Show fallback UI or instructions
  }
}
```

## 🔍 Feature Detection

Always use feature detection to provide the best user experience:

```typescript
const getMIDICapabilities = async () => {
  const platform = Capacitor.getPlatform();

  if (platform === 'ios') {
    return {
      platform: 'ios',
      support: 'full',
      implementation: 'native-coremidi',
      features: [
        'all-midi-messages',
        'low-latency',
        'reliable-device-handling',
      ],
    };
  }

  if (platform === 'web') {
    const hasWebMIDI = !!navigator.requestMIDIAccess;
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return {
        platform: 'safari',
        support: 'limited',
        implementation: 'webmidi-limited',
        features: ['basic-midi', 'requires-permission'],
        limitations: [
          'unreliable-sysex',
          'timing-issues',
          'permission-required',
        ],
      };
    }

    if (hasWebMIDI) {
      return {
        platform: 'web',
        support: 'full',
        implementation: 'webmidi',
        features: ['all-midi-messages', 'good-timing', 'device-management'],
      };
    }
  }

  return {
    platform: platform,
    support: 'none',
    implementation: 'unsupported',
    features: [],
  };
};
```

## 📊 Usage Recommendations

### For Web Applications

1. **Primary Support**: Chrome, Firefox, Edge
2. **Secondary Support**: Safari (with limitations and warnings)
3. **Fallback**: Provide instructions for using supported browsers

### For Mobile Applications

1. **iOS**: Always use native implementation
2. **Android**: Use WebMIDI through Chrome/WebView
3. **Cross-platform**: Detect platform and use appropriate implementation

### User Experience Guidelines

```typescript
// Good UX pattern
const initializeMIDI = async () => {
  const capabilities = await getMIDICapabilities();

  switch (capabilities.support) {
    case 'full':
      // Proceed with full MIDI functionality
      await initializeFullMIDI();
      break;

    case 'limited':
      // Show warning about limitations
      showSafariLimitationsWarning();
      await initializeLimitedMIDI();
      break;

    case 'none':
      // Show browser upgrade suggestion
      showUnsupportedBrowserMessage();
      break;
  }
};

const showSafariLimitationsWarning = () => {
  // Inform users about Safari limitations
  console.warn(`
    WebMIDI support in Safari is limited. For the best MIDI experience:
    - Use Chrome, Firefox, or Edge browsers
    - On iOS devices, use the native iOS app for full MIDI support
  `);
};
```

## 🔮 Future Support

### Upcoming Browser Features

- **Safari**: Continued improvements to WebMIDI implementation
- **iOS Safari**: Unlikely to get full WebMIDI support due to iOS restrictions
- **Android**: Better WebMIDI integration in WebView components

### Plugin Development

This plugin will continue to:

- Monitor browser WebMIDI API improvements
- Provide the best available implementation for each platform
- Maintain feature detection and graceful degradation
- Update documentation with latest browser support information
