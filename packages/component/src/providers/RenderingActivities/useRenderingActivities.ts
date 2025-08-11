import { type WebChatActivity } from 'botframework-webchat-core';

import { useRenderingActivitiesContext } from './private/RenderingActivitiesContext';

export default function useRenderingActivities(): readonly [readonly WebChatActivity[]] {
  return useRenderingActivitiesContext().renderingActivitiesState;
}
