# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is @kurogedelic/capacitor-midi, an enhanced fork of musetrainer/capacitor-musetrainer-midi that provides comprehensive cross-platform MIDI functionality for web and iOS applications. The plugin bridges native MIDI implementations with JavaScript, offering modern TypeScript support and extensive testing.

## Build and Development Commands

```bash
# Build the plugin
npm run build

# Clean build artifacts
npm run clean

# Watch for TypeScript changes during development
npm run watch

# Verify both iOS and web implementations
npm run verify

# Verify iOS implementation only
npm run verify:ios

# Verify web implementation only
npm run verify:web

# Lint and format code
npm run lint
npm run format

# Generate documentation
npm run docgen
```

## Architecture

### Core Components

- **src/definitions.ts**: TypeScript interfaces defining the plugin API
- **src/index.ts**: Main entry point that registers the plugin with Capacitor
- **src/web.ts**: Web implementation using WebMIDI API
- **ios/Plugin/**: iOS implementation using MIKMIDI framework

### Plugin Structure

The plugin follows Capacitor's standard architecture:

1. **Interface Definition**: `CapacitorMuseTrainerMidiPlugin` interface defines three main methods:
   - `addListener()`: Subscribe to MIDI events (deviceChange, commandReceive, connectError)
   - `sendCommand()`: Send MIDI commands to connected devices
   - `listDevices()`: Get list of available MIDI devices

2. **Platform Implementations**:
   - **Web**: Uses WebMIDI API, filters out "Midi Through" devices, handles NOTE_ON/NOTE_OFF events
   - **iOS**: Uses MIKMIDI framework, manages device connections and event handling

3. **Event Handling**: The plugin emits events for:
   - Device connection changes
   - Incoming MIDI commands (noteOn/noteOff with pitch and velocity)
   - Connection errors

### Key Implementation Details

- Web implementation uses `navigator.requestMIDIAccess()` with sysex support
- iOS implementation filters devices by checking `!isVirtual`, has entities, and non-empty manufacturer
- MIDI command parsing extracts command type, pitch, and velocity from raw MIDI data
- Plugin automatically handles device state changes and reconnections

## Dependencies

- **Runtime**: @capacitor/core v7.4.0+, webmidi
- **iOS**: MIKMIDI framework (specified in Podspec), iOS 14.0+
- **Build**: TypeScript 5, Rollup, ESLint, Prettier, SwiftLint
- **Node.js**: 20+ (required for Capacitor v7)

## Testing and Verification

The project includes comprehensive testing infrastructure:

- **Jest test suite**: 26+ unit tests covering all MIDI functionality
- **Coverage reporting**: 80%+ code coverage with automated reporting
- **CI/CD pipeline**: GitHub Actions for automated testing and releases
- **Cross-platform verification**: Web and iOS build verification
- **iOS Native Testing**: Successful CI/CD builds with Capacitor v7 and iOS 14.0+

Run tests with `npm test` or `npm run test:coverage` for coverage reports.

## Fork Information

This repository is an enhanced fork of the original [musetrainer/capacitor-musetrainer-midi](https://github.com/musetrainer/capacitor-musetrainer-midi) with the following key improvements:

### Enhancements Over Original

- **Complete Type Safety**: Full TypeScript interfaces for all MIDI message types
- **Comprehensive Testing**: Jest test suite with 80%+ coverage
- **Enhanced Web Support**: Full CC, SysEx, and all MIDI message types on Web
- **Modern Tooling**: Capacitor v7, TypeScript 5, modern build tools
- **CI/CD Pipeline**: Automated testing, coverage, and release workflows
- **Better Documentation**: Comprehensive API docs and usage examples

### New Package Details

- **Package Name**: `@kurogedelic/capacitor-midi` (scoped package)
- **Repository**: https://github.com/kurogedelic/capacitor-midi
- **Maintains Compatibility**: Drop-in replacement for original with enhanced features
