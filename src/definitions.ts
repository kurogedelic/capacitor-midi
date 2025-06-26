import type { PluginListenerHandle } from '@capacitor/core';

export interface MIDIDevice {
  id: string;
  name: string;
  manufacturer: string;
  type: 'input' | 'output' | 'both';
  connected: boolean;
}

export interface MIDINoteMessage {
  type: 'noteOn' | 'noteOff';
  channel: number;
  note: number;
  velocity: number;
  timestamp: number;
}

export interface MIDIControlChangeMessage {
  type: 'controlChange';
  channel: number;
  controller: number;
  value: number;
  timestamp: number;
}

export interface MIDISysExMessage {
  type: 'sysex';
  data: number[];
  timestamp: number;
}

export interface MIDIProgramChangeMessage {
  type: 'programChange';
  channel: number;
  program: number;
  timestamp: number;
}

export interface MIDIChannelPressureMessage {
  type: 'channelPressure';
  channel: number;
  pressure: number;
  timestamp: number;
}

export interface MIDIPitchBendMessage {
  type: 'pitchBend';
  channel: number;
  value: number;
  timestamp: number;
}

export interface MIDIPolyphonicPressureMessage {
  type: 'polyphonicPressure';
  channel: number;
  note: number;
  pressure: number;
  timestamp: number;
}

export type MIDIMessage =
  | MIDINoteMessage
  | MIDIControlChangeMessage
  | MIDISysExMessage
  | MIDIProgramChangeMessage
  | MIDIChannelPressureMessage
  | MIDIPitchBendMessage
  | MIDIPolyphonicPressureMessage;

export interface MIDIDeviceChangeEvent {
  device: MIDIDevice;
  state: 'connected' | 'disconnected';
}

export interface MIDICommandReceiveEvent {
  message: MIDIMessage;
  deviceId: string;
}

export interface MIDIConnectErrorEvent {
  error: string;
  deviceId?: string;
}

export interface CapacitorMuseTrainerMidiPlugin {
  addListener(
    eventName: 'deviceChange',
    listenerFunc: (event: MIDIDeviceChangeEvent) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: 'commandReceive',
    listenerFunc: (event: MIDICommandReceiveEvent) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: 'connectError',
    listenerFunc: (event: MIDIConnectErrorEvent) => void,
  ): Promise<PluginListenerHandle>;

  sendCommand({
    command,
    timestamp,
  }: {
    command: number[];
    timestamp: number;
  }): Promise<void>;

  listDevices(): Promise<{ devices: MIDIDevice[] }>;
}
