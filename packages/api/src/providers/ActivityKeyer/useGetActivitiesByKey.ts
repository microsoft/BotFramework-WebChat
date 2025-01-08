import { type WebChatActivity } from 'botframework-webchat-core';

import useActivityKeyerContext from './private/useContext';

export default function useGetActivitiesByKey(): (key?: string) => readonly WebChatActivity[] | undefined {
  return useActivityKeyerContext().getActivitiesByKey;
}
