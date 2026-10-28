import { createContext } from 'react';

type TranscriptFocusContextType = {
  activeDescendantIdState: readonly [string];
  activeGroupDescendantIdState: readonly [string];
  focusByActivityKey: (activityKey: boolean | string | undefined, withFocus: boolean | undefined) => void;
  focusByGroupKey: (groupKey: string | undefined, withFocus: boolean | undefined) => void;
  focusedActivityKeyState: readonly [string];
  focusedExplicitlyState: readonly [boolean];
  focusedGroupKeyState: readonly [string];
  focusRelativeActivity: (delta: number) => void;
  getDescendantIdByActivityKey: (activityKey?: string) => string | undefined;
  /** Differentiates the descendant IDs of multiple transcripts on the same page. */
  prefix: string;
};

const TranscriptFocusContext = createContext<TranscriptFocusContextType>(undefined);

export default TranscriptFocusContext;

export type { TranscriptFocusContextType };
