import { createContext, type MutableRefObject } from 'react';

import { type FocusTranscriptInit } from '../../types/internal/FocusTranscriptInit';

export type ContextType = {
  focusTranscriptCallbacksRef: MutableRefObject<((init: FocusTranscriptInit) => Promise<void>)[]>;
};

const context = createContext<ContextType>(undefined as ContextType);

export default context;
