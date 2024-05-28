import { createPropagation } from 'use-propagate';

export type TranscriptScrollRelativeOptions = { direction: 'down' | 'up'; displacement?: number };

const { useListen: useRegisterScrollRelativeTranscript, usePropagate: useScrollRelativeTranscript } =
  createPropagation<TranscriptScrollRelativeOptions>();

export { useRegisterScrollRelativeTranscript, useScrollRelativeTranscript };
