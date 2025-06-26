/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { ListenerCallback, PluginListenerHandle } from '@capacitor/core';
import { WebPlugin } from '@capacitor/core';

import type {
  CapacitorMuseTrainerMidiPlugin,
  MIDIDevice,
  MIDIMessage,
  MIDIDeviceChangeEvent,
  MIDICommandReceiveEvent,
} from './definitions';

import MIDIAccess = WebMidi.MIDIAccess;
import MIDIMessageEvent = WebMidi.MIDIMessageEvent;
import MIDIInput = WebMidi.MIDIInput;
import MIDIOutput = WebMidi.MIDIOutput;

export class CapacitorMuseTrainerMidiWeb
  extends WebPlugin
  implements CapacitorMuseTrainerMidiPlugin
{
  midiInputs: MIDIInput[] = [];
  midiOutputs: MIDIOutput[] = [];
  access: MIDIAccess | null = null;

  async addListener(
    eventName: string,
    listenerFunc: ListenerCallback,
    // @ts-ignore https://github.com/typescript-eslint/typescript-eslint/issues/2034
  ): Promise<PluginListenerHandle> & PluginListenerHandle {
    if (eventName === 'deviceChange') {
      if (!this.access) {
        await this.listDevices();
      }

      if (this.access) {
        this.access.onstatechange = () =>
          this.listDevices().then(d => {
            const event: MIDIDeviceChangeEvent = {
              device: d.devices[0], // Simple implementation for now
              state: 'connected',
            };
            listenerFunc(event);
          });
      }

      return {
        remove: async () => {
          if (this.access) {
            this.access.onstatechange = () => {
              // Do nothing
            };
          }
        },
      };
    }

    if (eventName === 'commandReceive') {
      this.midiInputs.forEach(mi => {
        mi.onmidimessage = (event: MIDIMessageEvent) => {
          const message = this.parseMIDIMessage(event.data, event.timeStamp);
          if (message) {
            const commandEvent: MIDICommandReceiveEvent = {
              message,
              deviceId: mi.id || 'unknown',
            };
            listenerFunc(commandEvent);
          }
        };
      });

      return {
        remove: async () => {
          this.midiInputs.forEach(
            mi =>
              (mi.onmidimessage = () => {
                // Do nothing
              }),
          );
        },
      };
    }

    return {
      remove: async () => {
        // Do nothing
      },
    };
  }

  private parseMIDIMessage(
    data: Uint8Array,
    timestamp: number,
  ): MIDIMessage | null {
    if (data.length === 0) return null;

    const status = data[0];
    const channel = status & 0x0f;
    const command = (status & 0xf0) >> 4;

    // System Exclusive (SysEx) messages
    if (status === 0xf0) {
      return {
        type: 'sysex',
        data: Array.from(data),
        timestamp,
      };
    }

    // Channel messages
    switch (command) {
      case 0x8: // Note Off
        return {
          type: 'noteOff',
          channel,
          note: data[1] || 0,
          velocity: data[2] || 0,
          timestamp,
        };

      case 0x9: {
        // Note On
        const velocity = data[2] || 0;
        return {
          type: velocity === 0 ? 'noteOff' : 'noteOn',
          channel,
          note: data[1] || 0,
          velocity,
          timestamp,
        };
      }

      case 0xa: // Polyphonic Pressure (Aftertouch)
        return {
          type: 'polyphonicPressure',
          channel,
          note: data[1] || 0,
          pressure: data[2] || 0,
          timestamp,
        };

      case 0xb: // Control Change
        return {
          type: 'controlChange',
          channel,
          controller: data[1] || 0,
          value: data[2] || 0,
          timestamp,
        };

      case 0xc: // Program Change
        return {
          type: 'programChange',
          channel,
          program: data[1] || 0,
          timestamp,
        };

      case 0xd: // Channel Pressure
        return {
          type: 'channelPressure',
          channel,
          pressure: data[1] || 0,
          timestamp,
        };

      case 0xe: {
        // Pitch Bend
        const lsb = data[1] || 0;
        const msb = data[2] || 0;
        const value = (msb << 7) | lsb;
        return {
          type: 'pitchBend',
          channel,
          value,
          timestamp,
        };
      }

      default:
        return null;
    }
  }

  async sendCommand({
    command,
    timestamp,
  }: {
    command: number[];
    timestamp: number;
  }): Promise<void> {
    this.midiOutputs.forEach(out => {
      out.send(command, timestamp);
    });
  }

  async listDevices(): Promise<{ devices: MIDIDevice[] }> {
    try {
      this.access = await navigator.requestMIDIAccess?.({ sysex: true });
    } catch (error) {
      // Ignore it, just return empty
    }

    if (!this.access) {
      return {
        devices: [],
      };
    }

    const inputs = [];
    const outputs = [];
    const devices: MIDIDevice[] = [];

    const iterInputs = this.access.inputs.values();
    for (let o = iterInputs.next(); !o.done; o = iterInputs.next()) {
      if (!o.value.name?.includes('Midi Through')) inputs.push(o.value);
    }

    const iterOutputs = this.access.outputs.values();
    for (let o = iterOutputs.next(); !o.done; o = iterOutputs.next()) {
      if (!o.value.name?.includes('Midi Through')) outputs.push(o.value);
    }

    this.midiInputs = inputs;
    this.midiOutputs = outputs;

    // Convert inputs to MIDIDevice format
    inputs.forEach(input => {
      devices.push({
        id: input.id || 'unknown',
        name: input.name || 'Unknown Device',
        manufacturer: input.manufacturer || 'Unknown',
        type: 'input',
        connected: input.state === 'connected',
      });
    });

    // Convert outputs to MIDIDevice format
    outputs.forEach(output => {
      devices.push({
        id: output.id || 'unknown',
        name: output.name || 'Unknown Device',
        manufacturer: output.manufacturer || 'Unknown',
        type: 'output',
        connected: output.state === 'connected',
      });
    });

    return {
      devices,
    };
  }
}
