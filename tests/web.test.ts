import { CapacitorMuseTrainerMidiWeb } from '../src/web';

// Mock Web MIDI API
const mockMIDIInput = {
  id: 'input-1',
  name: 'Test Input',
  manufacturer: 'Test Manufacturer',
  state: 'connected',
  onmidimessage: null as any,
};

const mockMIDIOutput = {
  id: 'output-1',
  name: 'Test Output',
  manufacturer: 'Test Manufacturer',
  state: 'connected',
  send: jest.fn(),
};

const mockMIDIAccess = {
  inputs: new Map([['input-1', mockMIDIInput]]),
  outputs: new Map([['output-1', mockMIDIOutput]]),
  onstatechange: null,
  sysexEnabled: true,
};

// Mock navigator.requestMIDIAccess
Object.defineProperty(global.navigator, 'requestMIDIAccess', {
  value: jest.fn(),
  writable: true,
});

describe('CapacitorMuseTrainerMidiWeb', () => {
  let webPlugin: CapacitorMuseTrainerMidiWeb;

  beforeEach(() => {
    webPlugin = new CapacitorMuseTrainerMidiWeb();
    // Reset mocks
    mockMIDIAccess.inputs.clear();
    mockMIDIAccess.outputs.clear();
    jest.clearAllMocks();

    // Setup default mock return
    (global.navigator.requestMIDIAccess as jest.Mock).mockResolvedValue(
      mockMIDIAccess,
    );
  });

  describe('listDevices', () => {
    it('should return empty devices when no MIDI access', async () => {
      (global.navigator.requestMIDIAccess as jest.Mock).mockRejectedValue(
        new Error('MIDI not supported'),
      );

      const result = await webPlugin.listDevices();
      expect(result.devices).toEqual([]);
    });

    it('should return formatted devices when MIDI access available', async () => {
      mockMIDIAccess.inputs.set('input-1', mockMIDIInput);
      mockMIDIAccess.outputs.set('output-1', mockMIDIOutput);

      const result = await webPlugin.listDevices();

      expect(result.devices).toHaveLength(2);
      expect(result.devices[0]).toEqual({
        id: 'input-1',
        name: 'Test Input',
        manufacturer: 'Test Manufacturer',
        type: 'input',
        connected: true,
      });
      expect(result.devices[1]).toEqual({
        id: 'output-1',
        name: 'Test Output',
        manufacturer: 'Test Manufacturer',
        type: 'output',
        connected: true,
      });
    });

    it('should filter out Midi Through devices', async () => {
      const midiThroughInput = {
        ...mockMIDIInput,
        name: 'Midi Through Port-0',
      };
      mockMIDIAccess.inputs.set('through-1', midiThroughInput);
      mockMIDIAccess.inputs.set('input-1', mockMIDIInput);

      const result = await webPlugin.listDevices();

      expect(result.devices).toHaveLength(1);
      expect(result.devices[0].name).toBe('Test Input');
    });
  });

  describe('sendCommand', () => {
    it('should send command to all outputs', async () => {
      mockMIDIAccess.outputs.set('output-1', mockMIDIOutput);
      await webPlugin.listDevices(); // Initialize outputs

      const command = [0x90, 60, 100]; // Note On C4
      const timestamp = Date.now();

      await webPlugin.sendCommand({ command, timestamp });

      expect(mockMIDIOutput.send).toHaveBeenCalledWith(command, timestamp);
    });
  });

  describe('parseMIDIMessage', () => {
    it('should parse Note On message correctly', () => {
      const data = new Uint8Array([0x90, 60, 100]); // Note On C4, velocity 100
      const timestamp = 1000;

      const result = (webPlugin as any).parseMIDIMessage(data, timestamp);

      expect(result).toEqual({
        type: 'noteOn',
        channel: 0,
        note: 60,
        velocity: 100,
        timestamp: 1000,
      });
    });

    it('should parse Note Off message correctly', () => {
      const data = new Uint8Array([0x80, 60, 0]); // Note Off C4
      const timestamp = 1000;

      const result = (webPlugin as any).parseMIDIMessage(data, timestamp);

      expect(result).toEqual({
        type: 'noteOff',
        channel: 0,
        note: 60,
        velocity: 0,
        timestamp: 1000,
      });
    });

    it('should parse Note On with zero velocity as Note Off', () => {
      const data = new Uint8Array([0x90, 60, 0]); // Note On C4, velocity 0
      const timestamp = 1000;

      const result = (webPlugin as any).parseMIDIMessage(data, timestamp);

      expect(result).toEqual({
        type: 'noteOff',
        channel: 0,
        note: 60,
        velocity: 0,
        timestamp: 1000,
      });
    });

    it('should parse Control Change message correctly', () => {
      const data = new Uint8Array([0xb0, 7, 127]); // CC7 (Volume) = 127
      const timestamp = 1000;

      const result = (webPlugin as any).parseMIDIMessage(data, timestamp);

      expect(result).toEqual({
        type: 'controlChange',
        channel: 0,
        controller: 7,
        value: 127,
        timestamp: 1000,
      });
    });

    it('should parse Program Change message correctly', () => {
      const data = new Uint8Array([0xc0, 42]); // Program Change to program 42
      const timestamp = 1000;

      const result = (webPlugin as any).parseMIDIMessage(data, timestamp);

      expect(result).toEqual({
        type: 'programChange',
        channel: 0,
        program: 42,
        timestamp: 1000,
      });
    });

    it('should parse Pitch Bend message correctly', () => {
      const data = new Uint8Array([0xe0, 0x00, 0x40]); // Pitch bend center
      const timestamp = 1000;

      const result = (webPlugin as any).parseMIDIMessage(data, timestamp);

      expect(result).toEqual({
        type: 'pitchBend',
        channel: 0,
        value: 0x2000, // (0x40 << 7) | 0x00
        timestamp: 1000,
      });
    });

    it('should parse SysEx message correctly', () => {
      const data = new Uint8Array([0xf0, 0x43, 0x12, 0x00, 0xf7]); // SysEx message
      const timestamp = 1000;

      const result = (webPlugin as any).parseMIDIMessage(data, timestamp);

      expect(result).toEqual({
        type: 'sysex',
        data: [0xf0, 0x43, 0x12, 0x00, 0xf7],
        timestamp: 1000,
      });
    });

    it('should parse Channel Pressure message correctly', () => {
      const data = new Uint8Array([0xd0, 64]); // Channel pressure
      const timestamp = 1000;

      const result = (webPlugin as any).parseMIDIMessage(data, timestamp);

      expect(result).toEqual({
        type: 'channelPressure',
        channel: 0,
        pressure: 64,
        timestamp: 1000,
      });
    });

    it('should parse Polyphonic Pressure message correctly', () => {
      const data = new Uint8Array([0xa0, 60, 64]); // Polyphonic pressure on C4
      const timestamp = 1000;

      const result = (webPlugin as any).parseMIDIMessage(data, timestamp);

      expect(result).toEqual({
        type: 'polyphonicPressure',
        channel: 0,
        note: 60,
        pressure: 64,
        timestamp: 1000,
      });
    });

    it('should return null for empty data', () => {
      const data = new Uint8Array([]);
      const timestamp = 1000;

      const result = (webPlugin as any).parseMIDIMessage(data, timestamp);

      expect(result).toBeNull();
    });

    it('should return null for unknown message types', () => {
      const data = new Uint8Array([0xff, 0x00]); // Unknown message
      const timestamp = 1000;

      const result = (webPlugin as any).parseMIDIMessage(data, timestamp);

      expect(result).toBeNull();
    });
  });

  describe('addListener', () => {
    it('should setup deviceChange listener', async () => {
      mockMIDIAccess.inputs.set('input-1', mockMIDIInput);
      const mockListener = jest.fn();

      const handle = await webPlugin.addListener('deviceChange', mockListener);

      expect(handle).toHaveProperty('remove');
      expect(typeof handle.remove).toBe('function');
    });

    it('should setup commandReceive listener', async () => {
      mockMIDIAccess.inputs.set('input-1', mockMIDIInput);
      await webPlugin.listDevices(); // Initialize inputs

      const mockListener = jest.fn();
      await webPlugin.addListener('commandReceive', mockListener);

      // Simulate MIDI message
      const midiEvent = {
        data: new Uint8Array([0x90, 60, 100]),
        timeStamp: 1000,
      };

      // Trigger the message handler
      if (mockMIDIInput.onmidimessage) {
        mockMIDIInput.onmidimessage(midiEvent as any);
      }

      expect(mockListener).toHaveBeenCalledWith({
        message: {
          type: 'noteOn',
          channel: 0,
          note: 60,
          velocity: 100,
          timestamp: 1000,
        },
        deviceId: 'input-1',
      });
    });
  });
});
