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
  getGroupDescendantIdByGroupKey: (groupKey?: string) => string | undefined;
  subscribeGroupDescendantId: (groupKey: string | undefined, listener: () => void) => () => void;
};

const TranscriptFocusContext = createContext<TranscriptFocusContextType>(undefined);

export default TranscriptFocusContext;

export type { TranscriptFocusContextType };
