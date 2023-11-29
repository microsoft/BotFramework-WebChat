import { type ActivityKey } from 'botframework-webchat-api';

import useTranscriptFocusContext from './private/useContext';

export default function useGetDescendantIdByActivityKey(): (activityKey?: ActivityKey) => string | undefined {
  return useTranscriptFocusContext().getDescendantIdByActivityKey;
}
