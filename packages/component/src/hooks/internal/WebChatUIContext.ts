import { createContext, type MutableRefObject } from 'react';

import { type FocusSendBoxInit } from '../../types/internal/FocusSendBoxInit';
import { type FocusTranscriptInit } from '../../types/internal/FocusTranscriptInit';

export type ContextType = {
  focusSendBoxCallbacksRef: MutableRefObject<((init: FocusSendBoxInit) => Promise<void>)[]>;
  focusTranscriptCallbacksRef: MutableRefObject<((init: FocusTranscriptInit) => Promise<void>)[]>;
};

const context = createContext<ContextType>(undefined as ContextType);

export default context;
