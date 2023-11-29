import { createContext } from 'react';
import { type ActivityKey } from 'botframework-webchat-api';

type TranscriptFocusContextType = {
  activeDescendantIdState: readonly [string];
  focusByActivityKey: (activityKey: boolean | ActivityKey | undefined, withFocus: boolean | undefined) => void;
  focusedActivityKeyState: readonly [ActivityKey];
  focusedExplicitlyState: readonly [boolean];
  focusRelativeActivity: (delta: number) => void;
  getDescendantIdByActivityKey: (activityKey?: ActivityKey) => string | undefined;
};

const TranscriptFocusContext = createContext<TranscriptFocusContextType>(undefined);

export default TranscriptFocusContext;

export type { TranscriptFocusContextType };
