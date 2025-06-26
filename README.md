[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/kurogedelic/capacitor-midi/blob/main/LICENSE)
[![CI](https://github.com/kurogedelic/capacitor-midi/workflows/CI/badge.svg)](https://github.com/kurogedelic/capacitor-midi/actions)

# capacitor-midi

Modern Capacitor MIDI plugin with comprehensive MIDI 1.0 support and full TypeScript integration.

![test](https://github.com/user-attachments/assets/254f1734-9fdd-4866-b981-cf218b3c55ec)

> **Note**: This is an enhanced fork of [musetrainer/capacitor-musetrainer-midi](https://github.com/musetrainer/capacitor-musetrainer-midi) with additional features, modern tooling, comprehensive tests, and improved developer experience.

## 🎵 Enhanced Example App

This repository now includes a fully functional MIDI test application that demonstrates all plugin capabilities:

- 🎹 **Virtual Keyboard**: Click keys to send MIDI notes with proper velocity
- 🎛️ **MIDI Controls**: Send CC, Program Change, Pitch Bend, and SysEx messages
- 📊 **Real-time Logging**: View all incoming MIDI messages with detailed information
- 🔌 **Device Management**: List and monitor MIDI device connections
- 🌐 **Web & iOS Ready**: Tested and working on both platforms

All MIDI message types have been verified working: **Note On/Off**, **SysEx**, **Pitch Bend**, **MIDI CC**, and **Program Change**.

## ✅ Testing Status

| Component                 | Status         | Notes                                               |
| ------------------------- | -------------- | --------------------------------------------------- |
| 📦 **npm Package**        | ✅ **Tested**  | Successfully published and installable              |
| 🌐 **Web Implementation** | ✅ **Tested**  | WebMIDI API working in Chrome/Firefox/Edge          |
| 🎹 **Example App**        | ✅ **Tested**  | Interactive demo with device detection and controls |
| 🧪 **Unit Tests**         | ✅ **Passing** | 26+ tests with 80%+ coverage                        |
| 🏗️ **Build System**       | ✅ **Working** | TypeScript, Rollup, and all tooling operational     |
| 📱 **iOS Native**         | ✅ **Passing** | CI/CD builds successfully with Capacitor v7         |
| 🤖 **CI/CD**              | ✅ **Passing** | GitHub Actions running successfully                 |

## ✨ Features

- 🎵 **Complete MIDI 1.0 Support**: Note On/Off, Control Change, Program Change, Pitch Bend, Channel Pressure, Polyphonic Pressure, System Exclusive (SysEx)
- 🌐 **Cross-Platform**: Web (WebMIDI API) and iOS (CoreMIDI via MIKMIDI)
- 🔒 **Type Safe**: Full TypeScript definitions with structured MIDI message types
- ⚡ **Real-time Performance**: Optimized for low-latency MIDI processing
- 🧪 **Well Tested**: Comprehensive test suite with 80%+ coverage
- 📦 **Modern Tooling**: Built with Capacitor v7, TypeScript 5, and modern build tools

## 🚀 Quick Start

### Installation

```bash
npm install @kurogedelic/capacitor-midi
npx cap sync
```

#### Alternative: Install from GitHub

If you can't access npm or need the latest development version:

```bash
npm install github:kurogedelic/capacitor-midi
npx cap sync
```

### Basic Usage

```typescript
import { CapacitorMidi } from '@kurogedelic/capacitor-midi';

// Initialize and list MIDI devices
const { devices } = await CapacitorMidi.listDevices();
console.log('Available MIDI devices:', devices);

// Listen for MIDI messages
CapacitorMidi.addListener('commandReceive', event => {
  const { message, deviceId } = event;

  switch (message.type) {
    case 'noteOn':
      console.log(`Note On: ${message.note}, velocity: ${message.velocity}`);
      break;
    case 'controlChange':
      console.log(`CC ${message.controller}: ${message.value}`);
      break;
    case 'sysex':
      console.log('SysEx message:', message.data);
      break;
  }
});

// Send MIDI commands
await CapacitorMidi.sendCommand({
  command: [0x90, 60, 100], // Note On C4, velocity 100
  timestamp: Date.now(),
});
```

## 🚀 Try the Example

Check out the enhanced example application in the [`example/`](./example/) directory:

```bash
cd example
npm install
npm run start    # For web development
# OR build for iOS:
npx cap build ios
npx cap open ios
```

The example app is a comprehensive MIDI test suite featuring:

- 🔌 **Device Management**: List and monitor MIDI device connections in real-time
- 🎹 **Virtual Keyboard**: Interactive piano keyboard with velocity-sensitive note sending
- 🎛️ **MIDI Controls**: Buttons for CC (Volume), Program Change, Pitch Bend, and SysEx
- 📊 **Message Logging**: Real-time display of all incoming MIDI messages
- 🧪 **Verified Functionality**: All MIDI message types tested and confirmed working
- 🌐 **Cross-Platform**: Works on both web browsers and iOS devices

## 🔧 Supported Platforms

- ✅ **Web**: Chrome 43+, Firefox 108+, Edge 79+
- ✅ **iOS**: iOS 14.0+ (using CoreMIDI via MIKMIDI framework) - **Recommended for iOS devices**
- ⏳ **Android**: Planned for future release

### WebMIDI Browser Support

| Browser        | Support Level | Notes                                  |
| -------------- | ------------- | -------------------------------------- |
| Chrome         | ✅ Full       | Complete WebMIDI API support since v43 |
| Firefox        | ✅ Full       | Complete support since v108            |
| Edge           | ✅ Full       | Complete support since v79             |
| Android Chrome | ✅ Full       | Same as desktop Chrome                 |

> **💡 Note**: For iOS devices, use the native iOS implementation instead of web browsers for optimal MIDI performance and reliability.

## 📋 Supported MIDI Messages

| Message Type        | Web | iOS | Description                                |
| ------------------- | --- | --- | ------------------------------------------ |
| Note On/Off         | ✅  | ✅  | Musical note events                        |
| Control Change      | ✅  | ✅  | Continuous controllers (volume, pan, etc.) |
| Program Change      | ✅  | ✅  | Instrument/patch changes                   |
| Pitch Bend          | ✅  | ✅  | Pitch wheel modulation                     |
| Channel Pressure    | ✅  | ✅  | Channel-wide pressure/aftertouch           |
| Polyphonic Pressure | ✅  | ✅  | Per-note pressure/aftertouch               |
| System Exclusive    | ✅  | ✅  | Manufacturer-specific messages             |

## 🏗️ Development

### Prerequisites

- Node.js 20+ (required for Capacitor 7)
- npm or yarn
- Xcode 16.0+ (for iOS development)
- Android Studio Ladybug | 2024.2.1+ with Java JDK 21 (for Android development)

### Setup

```bash
git clone https://github.com/kurogedelic/capacitor-midi.git
cd capacitor-midi
npm install
```

#### Using in Your Project

**From npm:**

```bash
npm install @kurogedelic/capacitor-midi
```

**From GitHub (if npm is not accessible):**

```bash
npm install github:kurogedelic/capacitor-midi
```

### Available Scripts

```bash
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run build         # Build the plugin
npm run lint          # Check code quality
npm run format        # Format code
npm run verify        # Verify both iOS and Web builds
```

### Testing

The plugin includes comprehensive unit tests covering all MIDI functionality:

```bash
npm test
# Test Suites: 2 passed, 2 total
# Tests: 26 passed, 26 total
```

### Integration Testing

**✅ Completed:**

- Web implementation tested with interactive example app
- npm package installation and import verification
- WebMIDI API functionality in modern browsers
- TypeScript type definitions and IntelliSense
- Unit tests covering all MIDI message types

**✅ Recently Completed:**

- iOS native implementation tested and verified working
- Real device testing with physical MIDI hardware completed
- All MIDI message types (Note, SysEx, Pitch Bend, CC, Program Change) confirmed functional
- Enhanced example app with comprehensive testing interface

**⏳ Next Steps:**

- Performance testing under heavy MIDI load
- Background MIDI processing optimization for iOS
- Android platform support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 API Documentation

<docgen-index>

- [`addListener('deviceChange', ...)`](#addlistenerdevicechange)
- [`addListener('commandReceive', ...)`](#addlistenercommandreceive)
- [`addListener('connectError', ...)`](#addlistenerconnecterror)
- [`sendCommand(...)`](#sendcommand)
- [`listDevices()`](#listdevices)
- [Interfaces](#interfaces)
- [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### addListener('deviceChange', ...)

```typescript
addListener(eventName: 'deviceChange', listenerFunc: (event: MIDIDeviceChangeEvent) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'deviceChange'</code>                                                                 |
| **`listenerFunc`** | <code>(event: <a href="#mididevicechangeevent">MIDIDeviceChangeEvent</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

---

### addListener('commandReceive', ...)

```typescript
addListener(eventName: 'commandReceive', listenerFunc: (event: MIDICommandReceiveEvent) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'commandReceive'</code>                                                                   |
| **`listenerFunc`** | <code>(event: <a href="#midicommandreceiveevent">MIDICommandReceiveEvent</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

---

### addListener('connectError', ...)

```typescript
addListener(eventName: 'connectError', listenerFunc: (event: MIDIConnectErrorEvent) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'connectError'</code>                                                                 |
| **`listenerFunc`** | <code>(event: <a href="#midiconnecterrorevent">MIDIConnectErrorEvent</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

---

### sendCommand(...)

```typescript
sendCommand({ command, timestamp, }: { command: number[]; timestamp: number; }) => Promise<void>
```

| Param     | Type                                                   |
| --------- | ------------------------------------------------------ |
| **`__0`** | <code>{ command: number[]; timestamp: number; }</code> |

---

### listDevices()

```typescript
listDevices() => Promise<{ devices: MIDIDevice[]; }>
```

**Returns:** <code>Promise&lt;{ devices: MIDIDevice[]; }&gt;</code>

---

### Interfaces

#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |

#### MIDIDeviceChangeEvent

| Prop         | Type                                              |
| ------------ | ------------------------------------------------- |
| **`device`** | <code><a href="#mididevice">MIDIDevice</a></code> |
| **`state`**  | <code>'connected' \| 'disconnected'</code>        |

#### MIDIDevice

| Prop               | Type                                       |
| ------------------ | ------------------------------------------ |
| **`id`**           | <code>string</code>                        |
| **`name`**         | <code>string</code>                        |
| **`manufacturer`** | <code>string</code>                        |
| **`type`**         | <code>'input' \| 'output' \| 'both'</code> |
| **`connected`**    | <code>boolean</code>                       |

#### MIDICommandReceiveEvent

| Prop           | Type                                                |
| -------------- | --------------------------------------------------- |
| **`message`**  | <code><a href="#midimessage">MIDIMessage</a></code> |
| **`deviceId`** | <code>string</code>                                 |

#### MIDINoteMessage

| Prop            | Type                               |
| --------------- | ---------------------------------- |
| **`type`**      | <code>'noteOn' \| 'noteOff'</code> |
| **`channel`**   | <code>number</code>                |
| **`note`**      | <code>number</code>                |
| **`velocity`**  | <code>number</code>                |
| **`timestamp`** | <code>number</code>                |

#### MIDIControlChangeMessage

| Prop             | Type                         |
| ---------------- | ---------------------------- |
| **`type`**       | <code>'controlChange'</code> |
| **`channel`**    | <code>number</code>          |
| **`controller`** | <code>number</code>          |
| **`value`**      | <code>number</code>          |
| **`timestamp`**  | <code>number</code>          |

#### MIDISysExMessage

| Prop            | Type                  |
| --------------- | --------------------- |
| **`type`**      | <code>'sysex'</code>  |
| **`data`**      | <code>number[]</code> |
| **`timestamp`** | <code>number</code>   |

#### MIDIProgramChangeMessage

| Prop            | Type                         |
| --------------- | ---------------------------- |
| **`type`**      | <code>'programChange'</code> |
| **`channel`**   | <code>number</code>          |
| **`program`**   | <code>number</code>          |
| **`timestamp`** | <code>number</code>          |

#### MIDIChannelPressureMessage

| Prop            | Type                           |
| --------------- | ------------------------------ |
| **`type`**      | <code>'channelPressure'</code> |
| **`channel`**   | <code>number</code>            |
| **`pressure`**  | <code>number</code>            |
| **`timestamp`** | <code>number</code>            |

#### MIDIPitchBendMessage

| Prop            | Type                     |
| --------------- | ------------------------ |
| **`type`**      | <code>'pitchBend'</code> |
| **`channel`**   | <code>number</code>      |
| **`value`**     | <code>number</code>      |
| **`timestamp`** | <code>number</code>      |

#### MIDIPolyphonicPressureMessage

| Prop            | Type                              |
| --------------- | --------------------------------- |
| **`type`**      | <code>'polyphonicPressure'</code> |
| **`channel`**   | <code>number</code>               |
| **`note`**      | <code>number</code>               |
| **`pressure`**  | <code>number</code>               |
| **`timestamp`** | <code>number</code>               |

#### MIDIConnectErrorEvent

| Prop           | Type                |
| -------------- | ------------------- |
| **`error`**    | <code>string</code> |
| **`deviceId`** | <code>string</code> |

### Type Aliases

#### MIDIMessage

<code><a href="#midinotemessage">MIDINoteMessage</a> | <a href="#midicontrolchangemessage">MIDIControlChangeMessage</a> | <a href="#midisysexmessage">MIDISysExMessage</a> | <a href="#midiprogramchangemessage">MIDIProgramChangeMessage</a> | <a href="#midichannelpressuremessage">MIDIChannelPressureMessage</a> | <a href="#midipitchbendmessage">MIDIPitchBendMessage</a> | <a href="#midipolyphonicpressuremessage">MIDIPolyphonicPressureMessage</a></code>

</docgen-api>

## 🆚 Differences from Original

This enhanced fork includes several improvements over the original [musetrainer/capacitor-musetrainer-midi](https://github.com/musetrainer/capacitor-musetrainer-midi):

### ✨ New Features

- **🔒 Complete Type Safety**: Structured TypeScript interfaces for all MIDI message types
- **🧪 Comprehensive Testing**: 26+ unit tests with 80%+ coverage
- **📊 Enhanced Web Support**: Full CC, SysEx, and all MIDI message types on Web platform
- **⚡ Modern Tooling**: Capacitor v7, TypeScript 5, Jest, modern ESLint/Prettier

### 🛠️ Developer Experience

- **🚀 CI/CD Pipeline**: GitHub Actions with automated testing and releases
- **📋 Project Templates**: Issue templates, PR templates, proper documentation
- **🤖 Automation**: Dependabot, automated coverage reporting, release workflows
- **📖 Better Documentation**: Comprehensive API docs, usage examples, migration guides

### 🔧 Technical Improvements

- **🏗️ Modern Build System**: Rollup v4, ES modules, CommonJS, and IIFE outputs
- **🎯 Better Error Handling**: Structured error reporting and debugging
- **📦 Package Management**: Scoped npm package with proper versioning
- **🔍 Code Quality**: Linting, formatting, and code quality checks
- **🌐 Better Browser Support**: Detailed WebMIDI compatibility information and fallbacks

## 📜 License

MIT © [Leo Kuroshita @ kurogedelic](https://x.com/kurogedelic)

Original work © [MuseTrainer](https://github.com/musetrainer)

## 🙏 Acknowledgments

- **Original Plugin**: [musetrainer/capacitor-musetrainer-midi](https://github.com/musetrainer/capacitor-musetrainer-midi) - The excellent foundation this fork builds upon
- [MIKMIDI](https://github.com/mixedinkey-opensource/MIKMIDI) - Excellent CoreMIDI wrapper for iOS
- [Web MIDI API](https://webaudio.github.io/web-midi-api/) - W3C specification for web MIDI
- [Capacitor](https://capacitorjs.com/) - Amazing cross-platform app development framework
