import { type WebChatActivity } from 'botframework-webchat-core';
import { useContext } from 'react';

import LatestActivitiesContext from './private/Context';

export default function useLatestActivities(): readonly [readonly Readonly<WebChatActivity>[]] {
  return useContext(LatestActivitiesContext).latestActivitiesState;
}
