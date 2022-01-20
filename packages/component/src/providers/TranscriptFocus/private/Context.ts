import { createContext } from 'react';

type TranscriptFocusContextType = {
  activeDescendantIdState: readonly [string];
  computeElementIdFromActivityKey: (activityKey?: string) => string | undefined;
  focusByActivityKey: (activityKey: boolean | string | undefined, withFocus: boolean | undefined) => void;
  focusedActivityKeyState: readonly [string];
  focusedExplicitlyState: readonly [boolean];
  focusRelativeActivity: (delta: number) => void;
};

const TranscriptFocusContext = createContext<TranscriptFocusContextType>(undefined);

export default TranscriptFocusContext;

export type { TranscriptFocusContextType };
