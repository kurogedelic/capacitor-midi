import type {
  MIDIMessage,
  MIDINoteMessage,
  MIDIControlChangeMessage,
  MIDISysExMessage,
  MIDIDevice,
  MIDIDeviceChangeEvent,
  MIDICommandReceiveEvent,
} from '../src/definitions';

describe('Type Definitions', () => {
  describe('MIDIDevice', () => {
    it('should accept valid device object', () => {
      const device: MIDIDevice = {
        id: 'device-1',
        name: 'Test Device',
        manufacturer: 'Test Manufacturer',
        type: 'input',
        connected: true,
      };

      expect(device.id).toBe('device-1');
      expect(device.type).toBe('input');
      expect(device.connected).toBe(true);
    });

    it('should accept all valid device types', () => {
      const inputDevice: MIDIDevice = {
        id: '1',
        name: 'Input',
        manufacturer: 'Test',
        type: 'input',
        connected: true,
      };

      const outputDevice: MIDIDevice = {
        id: '2',
        name: 'Output',
        manufacturer: 'Test',
        type: 'output',
        connected: true,
      };

      const bothDevice: MIDIDevice = {
        id: '3',
        name: 'Both',
        manufacturer: 'Test',
        type: 'both',
        connected: true,
      };

      expect(inputDevice.type).toBe('input');
      expect(outputDevice.type).toBe('output');
      expect(bothDevice.type).toBe('both');
    });
  });

  describe('MIDI Messages', () => {
    it('should accept valid Note On message', () => {
      const noteOnMessage: MIDINoteMessage = {
        type: 'noteOn',
        channel: 0,
        note: 60,
        velocity: 100,
        timestamp: 1000,
      };

      expect(noteOnMessage.type).toBe('noteOn');
      expect(noteOnMessage.note).toBe(60);
    });

    it('should accept valid Note Off message', () => {
      const noteOffMessage: MIDINoteMessage = {
        type: 'noteOff',
        channel: 0,
        note: 60,
        velocity: 0,
        timestamp: 1000,
      };

      expect(noteOffMessage.type).toBe('noteOff');
      expect(noteOffMessage.velocity).toBe(0);
    });

    it('should accept valid Control Change message', () => {
      const ccMessage: MIDIControlChangeMessage = {
        type: 'controlChange',
        channel: 0,
        controller: 7,
        value: 127,
        timestamp: 1000,
      };

      expect(ccMessage.type).toBe('controlChange');
      expect(ccMessage.controller).toBe(7);
      expect(ccMessage.value).toBe(127);
    });

    it('should accept valid SysEx message', () => {
      const sysexMessage: MIDISysExMessage = {
        type: 'sysex',
        data: [0xf0, 0x43, 0x12, 0x00, 0xf7],
        timestamp: 1000,
      };

      expect(sysexMessage.type).toBe('sysex');
      expect(sysexMessage.data).toEqual([0xf0, 0x43, 0x12, 0x00, 0xf7]);
    });

    it('should accept MIDIMessage union type', () => {
      const messages: MIDIMessage[] = [
        {
          type: 'noteOn',
          channel: 0,
          note: 60,
          velocity: 100,
          timestamp: 1000,
        },
        {
          type: 'controlChange',
          channel: 0,
          controller: 7,
          value: 127,
          timestamp: 1000,
        },
        {
          type: 'sysex',
          data: [0xf0, 0xf7],
          timestamp: 1000,
        },
      ];

      expect(messages).toHaveLength(3);
      expect(messages[0].type).toBe('noteOn');
      expect(messages[1].type).toBe('controlChange');
      expect(messages[2].type).toBe('sysex');
    });
  });

  describe('Event Types', () => {
    it('should accept valid device change event', () => {
      const event: MIDIDeviceChangeEvent = {
        device: {
          id: 'device-1',
          name: 'Test Device',
          manufacturer: 'Test',
          type: 'input',
          connected: true,
        },
        state: 'connected',
      };

      expect(event.state).toBe('connected');
      expect(event.device.id).toBe('device-1');
    });

    it('should accept valid command receive event', () => {
      const event: MIDICommandReceiveEvent = {
        message: {
          type: 'noteOn',
          channel: 0,
          note: 60,
          velocity: 100,
          timestamp: 1000,
        },
        deviceId: 'device-1',
      };

      expect(event.deviceId).toBe('device-1');
      expect(event.message.type).toBe('noteOn');
    });
  });
});
