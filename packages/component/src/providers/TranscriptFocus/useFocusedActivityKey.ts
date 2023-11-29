import { type ActivityKey } from 'botframework-webchat-api';

import useTranscriptFocusContext from './private/useContext';

export default function useFocusedActivityKey(): readonly [ActivityKey] {
  return useTranscriptFocusContext().focusedActivityKeyState;
}
