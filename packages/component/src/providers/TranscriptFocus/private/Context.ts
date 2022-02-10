import { createContext } from 'react';

type TranscriptFocusContextType = {
  activeDescendantIdState: readonly [string];
  focusByActivityKey: (activityKey: boolean | string | undefined, withFocus: boolean | undefined) => void;
  focusedActivityKeyState: readonly [string];
  focusedExplicitlyState: readonly [boolean];
  focusRelativeActivity: (delta: number) => void;
  getDescendantIdByActivityKey: (activityKey?: string) => string | undefined;
};

const TranscriptFocusContext = createContext<TranscriptFocusContextType>(undefined);

export default TranscriptFocusContext;

export type { TranscriptFocusContextType };
