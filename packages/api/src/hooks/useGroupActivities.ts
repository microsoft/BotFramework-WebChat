import { type WebChatActivity } from 'botframework-webchat-core';

import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useGroupActivities(): ({
  activities
}: Readonly<{ activities: readonly WebChatActivity[] }>) => {
  sender: readonly (readonly WebChatActivity[])[];
  status: readonly (readonly WebChatActivity[])[];
} {
  return useWebChatAPIContext().groupActivities;
}
