import { CapacitorMidi } from '@kurogedelic/capacitor-midi';
import type { MIDIDevice, MIDIMessage } from '@kurogedelic/capacitor-midi';

class MidiExample {
  private logElement: HTMLElement;
  private statusElement: HTMLElement;
  private deviceListElement: HTMLElement;
  private devices: MIDIDevice[] = [];
  private activeKeys = new Set<number>();

  constructor() {
    this.logElement = document.getElementById('log')!;
    this.statusElement = document.getElementById('status')!;
    this.deviceListElement = document.getElementById('deviceList')!;

    this.init();
  }

  private async init() {
    this.setupEventListeners();
    this.createVirtualKeyboard();
    await this.checkMidiSupport();
    this.setupMidiListeners();
  }

  private async checkMidiSupport() {
    try {
      // Try to list devices to check if MIDI is supported
      await CapacitorMidi.listDevices();
      this.showStatus('MIDI support detected! 🎵', 'success');
      this.log('✅ MIDI plugin initialized successfully');
    } catch (error) {
      this.showStatus('MIDI not supported or permission denied ❌', 'error');
      this.log(`❌ MIDI initialization failed: ${error}`);
    }
  }

  private setupEventListeners() {
    document.getElementById('listDevices')?.addEventListener('click', () => {
      this.listDevices();
    });

    document.getElementById('clearLog')?.addEventListener('click', () => {
      this.clearLog();
    });

    document.getElementById('sendCC')?.addEventListener('click', () => {
      this.sendControlChange();
    });

    document.getElementById('sendProgramChange')?.addEventListener('click', () => {
      this.sendProgramChange();
    });

    document.getElementById('sendPitchBend')?.addEventListener('click', () => {
      this.sendPitchBend();
    });

    document.getElementById('sendSysEx')?.addEventListener('click', () => {
      this.sendSysEx();
    });
  }

  private setupMidiListeners() {
    // Listen for incoming MIDI messages
    CapacitorMidi.addListener('commandReceive', (event) => {
      this.handleMidiMessage(event.message, event.deviceId);
    });

    // Listen for device changes
    CapacitorMidi.addListener('deviceChange', (event) => {
      this.log(`🔌 Device ${event.state}: ${event.device.name}`);
      this.listDevices(); // Refresh device list
    });

    // Listen for connection errors
    CapacitorMidi.addListener('connectError', (event) => {
      this.log(`❌ Connection error: ${event.error} (Device: ${event.deviceId})`);
    });
  }

  private handleMidiMessage(message: MIDIMessage, deviceId: string) {
    const device = this.devices.find(d => d.id === deviceId);
    const deviceName = device?.name || deviceId;

    switch (message.type) {
      case 'noteOn':
        this.log(`🎵 Note ON: ${this.noteNumberToName(message.note)} (${message.note}) vel=${message.velocity} [${deviceName}]`);
        this.highlightKey(message.note, true);
        break;
      
      case 'noteOff':
        this.log(`🎵 Note OFF: ${this.noteNumberToName(message.note)} (${message.note}) vel=${message.velocity} [${deviceName}]`);
        this.highlightKey(message.note, false);
        break;
      
      case 'controlChange':
        this.log(`🎛️ CC ${message.controller}: ${message.value} ch=${message.channel} [${deviceName}]`);
        break;
      
      case 'programChange':
        this.log(`🎼 Program Change: ${message.program} ch=${message.channel} [${deviceName}]`);
        break;
      
      case 'pitchBend':
        this.log(`🎯 Pitch Bend: ${message.value} ch=${message.channel} [${deviceName}]`);
        break;
      
      case 'channelPressure':
        this.log(`👆 Channel Pressure: ${message.pressure} ch=${message.channel} [${deviceName}]`);
        break;
      
      case 'polyphonicPressure':
        this.log(`👆 Poly Pressure: note=${message.note} pressure=${message.pressure} ch=${message.channel} [${deviceName}]`);
        break;
      
      case 'sysex':
        this.log(`🔧 SysEx: [${message.data.slice(0, 10).join(', ')}${message.data.length > 10 ? '...' : ''}] (${message.data.length} bytes) [${deviceName}]`);
        break;
      
      default:
        this.log(`❓ Unknown MIDI message: ${JSON.stringify(message)} [${deviceName}]`);
    }
  }

  private async listDevices() {
    try {
      const result = await CapacitorMidi.listDevices();
      this.devices = result.devices;
      
      this.log(`📋 Found ${this.devices.length} MIDI devices:`);
      this.devices.forEach((device, index) => {
        this.log(`  ${index + 1}. ${device.name} (${device.manufacturer}) - ${device.type} - ${device.connected ? 'Connected' : 'Disconnected'}`);
      });

      this.updateDeviceList();
    } catch (error) {
      this.log(`❌ Error listing devices: ${error}`);
    }
  }

  private updateDeviceList() {
    this.deviceListElement.innerHTML = '';
    
    if (this.devices.length === 0) {
      this.deviceListElement.innerHTML = '<p>No MIDI devices found. Connect a MIDI device and click "List MIDI Devices".</p>';
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

  private createVirtualKeyboard() {
    const keyboard = document.getElementById('virtualKeyboard')!;
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
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

  private async playNote(note: number, velocity: number = 100) {
    if (this.activeKeys.has(note)) return;
    
    this.activeKeys.add(note);
    this.highlightKey(note, true);
    
    try {
      await CapacitorMidi.sendCommand({
        command: [0x90, note, velocity], // Note On
        timestamp: Date.now(),
      });
      this.log(`🎵 Sent Note ON: ${this.noteNumberToName(note)} (${note}) vel=${velocity}`);
    } catch (error) {
      this.log(`❌ Error sending Note ON: ${error}`);
    }
  }

  private async stopNote(note: number) {
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

  private highlightKey(note: number, active: boolean) {
    const key = document.querySelector(`[data-note="${note}"]`) as HTMLElement;
    if (key) {
      if (active) {
        key.classList.add('active');
      } else {
        key.classList.remove('active');
      }
    }
  }

  private async sendControlChange() {
    const controller = 7; // Volume
    const value = Math.floor(Math.random() * 128);
    
    try {
      await CapacitorMidi.sendCommand({
        command: [0xB0, controller, value], // CC on channel 1
        timestamp: Date.now(),
      });
      this.log(`🎛️ Sent CC ${controller} (Volume): ${value}`);
    } catch (error) {
      this.log(`❌ Error sending CC: ${error}`);
    }
  }

  private async sendProgramChange() {
    const program = Math.floor(Math.random() * 128);
    
    try {
      await CapacitorMidi.sendCommand({
        command: [0xC0, program], // Program Change on channel 1
        timestamp: Date.now(),
      });
      this.log(`🎼 Sent Program Change: ${program}`);
    } catch (error) {
      this.log(`❌ Error sending Program Change: ${error}`);
    }
  }

  private async sendPitchBend() {
    const value = Math.floor(Math.random() * 16384); // 14-bit value
    const lsb = value & 0x7F;
    const msb = (value >> 7) & 0x7F;
    
    try {
      await CapacitorMidi.sendCommand({
        command: [0xE0, lsb, msb], // Pitch Bend on channel 1
        timestamp: Date.now(),
      });
      this.log(`🎯 Sent Pitch Bend: ${value} (MSB=${msb}, LSB=${lsb})`);
    } catch (error) {
      this.log(`❌ Error sending Pitch Bend: ${error}`);
    }
  }

  private async sendSysEx() {
    // Send a simple SysEx message (General MIDI reset)
    const sysex = [0xF0, 0x7E, 0x7F, 0x09, 0x01, 0xF7];
    
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

  private noteNumberToName(noteNumber: number): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(noteNumber / 12) - 1;
    const note = notes[noteNumber % 12];
    return `${note}${octave}`;
  }

  private log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logElement.textContent += `[${timestamp}] ${message}\n`;
    this.logElement.scrollTop = this.logElement.scrollHeight;
  }

  private clearLog() {
    this.logElement.textContent = 'Log cleared.\n';
  }

  private showStatus(message: string, type: 'success' | 'error') {
    this.statusElement.textContent = message;
    this.statusElement.className = `status ${type}`;
  }
}

// Initialize the example when the page loads
new MidiExample();