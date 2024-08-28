import { createPropagation } from 'use-propagate';

export type TranscriptScrollRelativeOptions = { direction: 'down' | 'up'; displacement?: number };

const {
  PropagationScope: ScrollRelativeTranscriptScope,
  useListen: useRegisterScrollRelativeTranscript,
  usePropagate: useScrollRelativeTranscript
} = createPropagation<TranscriptScrollRelativeOptions>();

export { ScrollRelativeTranscriptScope, useRegisterScrollRelativeTranscript, useScrollRelativeTranscript };
