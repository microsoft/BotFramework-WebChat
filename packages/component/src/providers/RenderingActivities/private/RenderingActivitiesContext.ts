import { type ActivityPolymiddlewareRenderer } from 'botframework-webchat-api/middleware';
import { type WebChatActivity } from 'botframework-webchat-core';
import createContextAndHook from '../../createContextAndHook';

type RenderingActivitiesContextType = Readonly<{
  activityRendererMapState: readonly [ReadonlyMap<WebChatActivity, ActivityPolymiddlewareRenderer>];
  renderingActivitiesState: readonly [readonly WebChatActivity[]];
  renderingActivityKeysState: readonly [readonly string[]];
}>;

const { contextComponentType, useContext } =
  createContextAndHook<RenderingActivitiesContextType>('RenderingActivitiesContext');

export default contextComponentType;
export { useContext as useRenderingActivitiesContext, type RenderingActivitiesContextType };
