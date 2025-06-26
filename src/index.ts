import { registerPlugin } from '@capacitor/core';

import type { CapacitorMuseTrainerMidiPlugin } from './definitions';

const CapacitorMidi = registerPlugin<CapacitorMuseTrainerMidiPlugin>(
  'CapacitorMuseTrainerMidi',
  {
    web: () => import('./web').then(m => new m.CapacitorMuseTrainerMidiWeb()),
  },
);

export * from './definitions';
export { CapacitorMidi };

// Backward compatibility export
export { CapacitorMidi as CapacitorMuseTrainerMidi };
