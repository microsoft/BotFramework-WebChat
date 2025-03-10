import type { WebChatActivity } from 'botframework-webchat-core';

import useActivityKeyerContext from './private/useContext';

export default function useGetActivityByKey(): (key?: string) => undefined | WebChatActivity {
  return useActivityKeyerContext().getActivityByKey;
}
