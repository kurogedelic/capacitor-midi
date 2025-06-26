import { CapacitorMidi } from '@kurogedelic/capacitor-midi';

class MidiTestApp {
  constructor() {
    this.logElement = document.getElementById('log');
    this.statusElement = document.getElementById('status');
    this.deviceListElement = document.getElementById('deviceList');
    this.devices = [];
    this.activeKeys = new Set();

    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.createVirtualKeyboard();
    await this.checkMidiSupport();
    this.setupMidiListeners();
  }

  async checkMidiSupport() {
    // First check if WebMIDI API is available
    this.log('🔍 Checking WebMIDI API availability...');

    if (!navigator.requestMIDIAccess) {
      this.showStatus('WebMIDI API not supported in this browser ❌', 'error');
      this.log('❌ navigator.requestMIDIAccess is not available');
      this.log('💡 Try using Chrome, Firefox, or Edge browser');
      return;
    }

    this.log('✅ WebMIDI API is available');

    // Try to get MIDI access directly
    try {
      this.log('🔍 Requesting MIDI access...');
      const midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      this.log(
        `✅ MIDI access granted. SysEx enabled: ${midiAccess.sysexEnabled}`,
      );

      // Check native MIDI devices
      const inputs = Array.from(midiAccess.inputs.values());
      const outputs = Array.from(midiAccess.outputs.values());

      this.log(
        `🎹 Native WebMIDI found ${inputs.length} inputs, ${outputs.length} outputs`,
      );
      inputs.forEach((input, i) => {
        this.log(
          `  Input ${i + 1}: ${input.name} (${input.manufacturer}) - ${input.state}`,
        );
      });
      outputs.forEach((output, i) => {
        this.log(
          `  Output ${i + 1}: ${output.name} (${output.manufacturer}) - ${output.state}`,
        );
      });
    } catch (error) {
      this.log(`❌ Failed to get MIDI access: ${error}`);
    }

    // Now try the plugin
    try {
      this.log('🔍 Testing Capacitor MIDI plugin...');
      await CapacitorMidi.listDevices();
      this.showStatus('MIDI support detected! 🎵', 'success');
      this.log('✅ MIDI plugin initialized successfully');
    } catch (error) {
      this.showStatus('MIDI plugin error ❌', 'error');
      this.log(`❌ MIDI plugin failed: ${error}`);
    }
  }

  setupEventListeners() {
    document.getElementById('listDevices')?.addEventListener('click', () => {
      this.listDevices();
    });

    document.getElementById('debugWebMIDI')?.addEventListener('click', () => {
      this.debugWebMIDI();
    });

    document.getElementById('clearLog')?.addEventListener('click', () => {
      this.clearLog();
    });

    document.getElementById('sendCC')?.addEventListener('click', () => {
      this.sendControlChange();
    });

    document
      .getElementById('sendProgramChange')
      ?.addEventListener('click', () => {
        this.sendProgramChange();
      });

    document.getElementById('sendPitchBend')?.addEventListener('click', () => {
      this.sendPitchBend();
    });

    document.getElementById('sendSysEx')?.addEventListener('click', () => {
      this.sendSysEx();
    });
  }

  setupMidiListeners() {
    // Listen for incoming MIDI messages
    CapacitorMidi.addListener('commandReceive', event => {
      this.handleMidiMessage(event.message, event.deviceId);
    });

    // Listen for device changes
    CapacitorMidi.addListener('deviceChange', event => {
      this.log(`🔌 Device ${event.state}: ${event.device.name}`);
      this.listDevices(); // Refresh device list
    });

    // Listen for connection errors
    CapacitorMidi.addListener('connectError', event => {
      this.log(
        `❌ Connection error: ${event.error} (Device: ${event.deviceId})`,
      );
    });
  }

  handleMidiMessage(message, deviceId) {
    const device = this.devices.find(d => d.id === deviceId);
    const deviceName = device?.name || deviceId;

    switch (message.type) {
      case 'noteOn':
        this.log(
          `🎵 Note ON: ${this.noteNumberToName(message.note)} (${message.note}) vel=${message.velocity} [${deviceName}]`,
        );
        this.highlightKey(message.note, true);
        break;

      case 'noteOff':
        this.log(
          `🎵 Note OFF: ${this.noteNumberToName(message.note)} (${message.note}) vel=${message.velocity} [${deviceName}]`,
        );
        this.highlightKey(message.note, false);
        break;

      case 'controlChange':
        this.log(
          `🎛️ CC ${message.controller}: ${message.value} ch=${message.channel} [${deviceName}]`,
        );
        break;

      case 'programChange':
        this.log(
          `🎼 Program Change: ${message.program} ch=${message.channel} [${deviceName}]`,
        );
        break;

      case 'pitchBend':
        this.log(
          `🎯 Pitch Bend: ${message.value} ch=${message.channel} [${deviceName}]`,
        );
        break;

      case 'channelPressure':
        this.log(
          `👆 Channel Pressure: ${message.pressure} ch=${message.channel} [${deviceName}]`,
        );
        break;

      case 'polyphonicPressure':
        this.log(
          `👆 Poly Pressure: note=${message.note} pressure=${message.pressure} ch=${message.channel} [${deviceName}]`,
        );
        break;

      case 'sysex':
        this.log(
          `🔧 SysEx: [${message.data.slice(0, 10).join(', ')}${message.data.length > 10 ? '...' : ''}] (${message.data.length} bytes) [${deviceName}]`,
        );
        break;

      default:
        this.log(
          `❓ Unknown MIDI message: ${JSON.stringify(message)} [${deviceName}]`,
        );
    }
  }

  async listDevices() {
    try {
      const result = await CapacitorMidi.listDevices();
      this.devices = result.devices;

      this.log(`📋 Found ${this.devices.length} MIDI devices:`);
      this.devices.forEach((device, index) => {
        this.log(
          `  ${index + 1}. ${device.name} (${device.manufacturer}) - ${device.type} - ${device.connected ? 'Connected' : 'Disconnected'}`,
        );
      });

      this.updateDeviceList();
    } catch (error) {
      this.log(`❌ Error listing devices: ${error}`);
    }
  }

  updateDeviceList() {
    this.deviceListElement.innerHTML = '';

    if (this.devices.length === 0) {
      this.deviceListElement.innerHTML =
        '<p>No MIDI devices found. Connect a MIDI device and click "List MIDI Devices".</p>';
      return;
    }

    this.devices.forEach(device => {
      const deviceElement = document.createElement('div');
      deviceElement.className = `device-item ${device.connected ? '' : 'disconnected'}`;
      deviceElement.innerHTML = `
        <div><strong>${device.name}</strong></div>
        <div>Manufacturer: ${device.manufacturer}</div>
        <div>Type: ${device.type} | Status: ${device.connected ? '🟢 Connected' : '🔴 Disconnected'}</div>
        <div>ID: ${device.id}</div>
      `;
      this.deviceListElement.appendChild(deviceElement);
    });
  }

  createVirtualKeyboard() {
    const keyboard = document.getElementById('virtualKeyboard');
    const notes = [
      'C',
      'C#',
      'D',
      'D#',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'A',
      'A#',
      'B',
    ];
    const startNote = 60; // Middle C

    for (let i = 0; i < 12; i++) {
      const noteNumber = startNote + i;
      const noteName = notes[i];
      const isBlack = noteName.includes('#');

      const key = document.createElement('div');
      key.className = `key ${isBlack ? 'black' : 'white'}`;
      key.textContent = `${noteName}${Math.floor(noteNumber / 12) - 1}`;
      key.dataset.note = noteNumber.toString();

      key.addEventListener('mousedown', () => this.playNote(noteNumber, 100));
      key.addEventListener('mouseup', () => this.stopNote(noteNumber));
      key.addEventListener('mouseleave', () => this.stopNote(noteNumber));

      keyboard.appendChild(key);
    }
  }

  async playNote(note, velocity = 100) {
    if (this.activeKeys.has(note)) return;

    this.activeKeys.add(note);
    this.highlightKey(note, true);

    try {
      await CapacitorMidi.sendCommand({
        command: [0x90, note, velocity], // Note On
        timestamp: Date.now(),
      });
      this.log(
        `🎵 Sent Note ON: ${this.noteNumberToName(note)} (${note}) vel=${velocity}`,
      );
    } catch (error) {
      this.log(`❌ Error sending Note ON: ${error}`);
    }
  }

  async stopNote(note) {
    if (!this.activeKeys.has(note)) return;

    this.activeKeys.delete(note);
    this.highlightKey(note, false);

    try {
      await CapacitorMidi.sendCommand({
        command: [0x80, note, 0], // Note Off
        timestamp: Date.now(),
      });
      this.log(`🎵 Sent Note OFF: ${this.noteNumberToName(note)} (${note})`);
    } catch (error) {
      this.log(`❌ Error sending Note OFF: ${error}`);
    }
  }

  highlightKey(note, active) {
    const key = document.querySelector(`[data-note="${note}"]`);
    if (key) {
      if (active) {
        key.classList.add('active');
      } else {
        key.classList.remove('active');
      }
    }
  }

  async sendControlChange() {
    const controller = 7; // Volume
    const value = Math.floor(Math.random() * 128);

    try {
      await CapacitorMidi.sendCommand({
        command: [0xb0, controller, value], // CC on channel 1
        timestamp: Date.now(),
      });
      this.log(`🎛️ Sent CC ${controller} (Volume): ${value}`);
    } catch (error) {
      this.log(`❌ Error sending CC: ${error}`);
    }
  }

  async sendProgramChange() {
    const program = Math.floor(Math.random() * 128);

    try {
      await CapacitorMidi.sendCommand({
        command: [0xc0, program], // Program Change on channel 1
        timestamp: Date.now(),
      });
      this.log(`🎼 Sent Program Change: ${program}`);
    } catch (error) {
      this.log(`❌ Error sending Program Change: ${error}`);
    }
  }

  async sendPitchBend() {
    const value = Math.floor(Math.random() * 16384); // 14-bit value
    const lsb = value & 0x7f;
    const msb = (value >> 7) & 0x7f;

    try {
      await CapacitorMidi.sendCommand({
        command: [0xe0, lsb, msb], // Pitch Bend on channel 1
        timestamp: Date.now(),
      });
      this.log(`🎯 Sent Pitch Bend: ${value} (MSB=${msb}, LSB=${lsb})`);
    } catch (error) {
      this.log(`❌ Error sending Pitch Bend: ${error}`);
    }
  }

  async sendSysEx() {
    // Send a simple SysEx message (General MIDI reset)
    const sysex = [0xf0, 0x7e, 0x7f, 0x09, 0x01, 0xf7];

    try {
      await CapacitorMidi.sendCommand({
        command: sysex,
        timestamp: Date.now(),
      });
      this.log(`🔧 Sent SysEx: General MIDI Reset [${sysex.join(', ')}]`);
    } catch (error) {
      this.log(`❌ Error sending SysEx: ${error}`);
    }
  }

  noteNumberToName(noteNumber) {
    const notes = [
      'C',
      'C#',
      'D',
      'D#',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'A',
      'A#',
      'B',
    ];
    const octave = Math.floor(noteNumber / 12) - 1;
    const note = notes[noteNumber % 12];
    return `${note}${octave}`;
  }

  log(message) {
    const timestamp = new Date().toLocaleTimeString();
    this.logElement.textContent += `[${timestamp}] ${message}\n`;
    this.logElement.scrollTop = this.logElement.scrollHeight;
  }

  clearLog() {
    this.logElement.textContent = 'Log cleared.\n';
  }

  async debugWebMIDI() {
    this.log('🔧 === WebMIDI Debug Information ===');

    // Browser info
    this.log(`🌐 Browser: ${navigator.userAgent}`);
    this.log(`📍 URL: ${window.location.href}`);
    this.log(`🔒 HTTPS: ${window.location.protocol === 'https:'}`);

    // WebMIDI API availability
    this.log(`🎹 WebMIDI API available: ${!!navigator.requestMIDIAccess}`);

    if (!navigator.requestMIDIAccess) {
      this.log('❌ WebMIDI API not supported - stopping debug');
      return;
    }

    try {
      // Try with sysex: false first
      this.log('🔍 Requesting MIDI access (sysex: false)...');
      const midiAccess = await navigator.requestMIDIAccess({ sysex: false });

      this.log(`✅ MIDI Access granted:`);
      this.log(`  - SysEx enabled: ${midiAccess.sysexEnabled}`);
      this.log(`  - Inputs: ${midiAccess.inputs.size}`);
      this.log(`  - Outputs: ${midiAccess.outputs.size}`);

      // List all inputs
      this.log('📥 MIDI Inputs:');
      midiAccess.inputs.forEach((input, id) => {
        this.log(`  [${id}] ${input.name}`);
        this.log(`      Manufacturer: ${input.manufacturer || 'Unknown'}`);
        this.log(`      State: ${input.state}`);
        this.log(`      Connection: ${input.connection}`);
        this.log(`      Type: ${input.type}`);
        this.log(`      Version: ${input.version || 'Unknown'}`);
      });

      // List all outputs
      this.log('📤 MIDI Outputs:');
      midiAccess.outputs.forEach((output, id) => {
        this.log(`  [${id}] ${output.name}`);
        this.log(`      Manufacturer: ${output.manufacturer || 'Unknown'}`);
        this.log(`      State: ${output.state}`);
        this.log(`      Connection: ${output.connection}`);
        this.log(`      Type: ${output.type}`);
        this.log(`      Version: ${output.version || 'Unknown'}`);
      });

      // Try with sysex: true
      try {
        this.log('🔍 Requesting MIDI access (sysex: true)...');
        const sysexAccess = await navigator.requestMIDIAccess({ sysex: true });
        this.log(`✅ SysEx access granted: ${sysexAccess.sysexEnabled}`);
      } catch (sysexError) {
        this.log(`⚠️ SysEx access denied: ${sysexError}`);
      }
    } catch (error) {
      this.log(`❌ MIDI access failed: ${error}`);
      this.log(`Error details: ${JSON.stringify(error, null, 2)}`);
    }

    this.log('🔧 === End Debug Information ===');
  }

  showStatus(message, type) {
    this.statusElement.textContent = message;
    this.statusElement.className = `status ${type}`;
  }
}

// Initialize the app when the page loads
new MidiTestApp();
