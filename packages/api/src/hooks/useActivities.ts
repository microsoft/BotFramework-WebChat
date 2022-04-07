import type { WebChatActivity } from 'botframework-webchat-core';

import { useSelector } from './internal/WebChatReduxContext';

export default function useActivities(): [WebChatActivity[]] {
  return [useSelector(({ activities }) => activities)];
}
