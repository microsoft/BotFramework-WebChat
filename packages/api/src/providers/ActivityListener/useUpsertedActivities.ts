import type { WebChatActivity } from 'botframework-webchat-core';
import useActivityListenerContext from './private/useContext';

export default function useUpsertedActivities(): readonly [readonly WebChatActivity[]] {
  return useActivityListenerContext().upsertedActivitiesState;
}
