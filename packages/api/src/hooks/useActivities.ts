import type { DirectLineActivity } from 'botframework-webchat-core';

import { useSelector } from './internal/WebChatReduxContext';

export default function useActivities(): [DirectLineActivity[]] {
  return [useSelector(({ activities }) => activities)];
}
