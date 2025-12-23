import type { WebChatActivity } from 'botframework-webchat-core';
import { useGraphContext } from './GraphContext';

export default function useOrderedActivities(): readonly [readonly WebChatActivity[]] {
  return useGraphContext().orderedActivitiesState;
}
