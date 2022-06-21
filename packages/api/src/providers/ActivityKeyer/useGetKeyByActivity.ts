import type { WebChatActivity } from 'botframework-webchat-core';

import useActivityKeyerContext from './private/useContext';

export default function useGetKeyByActivity(): (activity?: WebChatActivity) => string | undefined {
  return useActivityKeyerContext().getKeyByActivity;
}
