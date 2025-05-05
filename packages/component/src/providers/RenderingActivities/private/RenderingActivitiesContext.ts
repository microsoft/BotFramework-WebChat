import { type ActivityComponentFactory } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import createContextAndHook from '../../createContextAndHook';

type RenderingActivitiesContextType = Readonly<{
  renderActivityCallbackMap: ReadonlyMap<WebChatActivity, Exclude<ReturnType<ActivityComponentFactory>, false>>;
  renderingActivitiesState: readonly [readonly WebChatActivity[]];
  renderingActivityKeysState: readonly [readonly string[]];
}>;

const { contextComponentType, useContext } =
  createContextAndHook<RenderingActivitiesContextType>('RenderingActivitiesContext');

export default contextComponentType;
export { useContext as useRenderingActivitiesContext, type RenderingActivitiesContextType };
