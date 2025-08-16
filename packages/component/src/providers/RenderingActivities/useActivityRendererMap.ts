import { type ActivityPolyMiddlewareRenderer } from 'botframework-webchat-api/middleware';
import { type WebChatActivity } from 'botframework-webchat-core';
import { useRenderingActivitiesContext } from './private/RenderingActivitiesContext';

export default function useActivityRendererMap(): readonly [
  ReadonlyMap<WebChatActivity, ActivityPolyMiddlewareRenderer>
] {
  return useRenderingActivitiesContext().activityRendererMapState;
}
