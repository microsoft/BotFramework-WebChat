import type { WebChatActivity } from 'botframework-webchat-core';

import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useGroupActivities(): ({ activities }: { activities: WebChatActivity[] }) => {
  sender: WebChatActivity[][];
  status: WebChatActivity[][];
} {
  return useWebChatAPIContext().groupActivities;
}
