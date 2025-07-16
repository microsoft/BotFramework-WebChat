import { type WebChatActivity } from 'botframework-webchat-core';
import { type ActivityPolyMiddlewareRenderer } from 'botframework-webchat-middleware';
import createContextAndHook from '../../createContextAndHook';

type RenderingActivitiesContextType = Readonly<{
  activityRendererMapState: readonly [ReadonlyMap<WebChatActivity, ActivityPolyMiddlewareRenderer>];
  renderingActivitiesState: readonly [readonly WebChatActivity[]];
  renderingActivityKeysState: readonly [readonly string[]];
}>;

const { contextComponentType, useContext } =
  createContextAndHook<RenderingActivitiesContextType>('RenderingActivitiesContext');

export default contextComponentType;
export { useContext as useRenderingActivitiesContext, type RenderingActivitiesContextType };
