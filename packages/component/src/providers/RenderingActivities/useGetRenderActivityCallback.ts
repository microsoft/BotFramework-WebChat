import { type ActivityComponentFactory } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';

import { useRenderingActivitiesContext } from './private/RenderingActivitiesContext';

export default function useGetRenderActivityCallback() {
  const { renderActivityCallbackMap } = useRenderingActivitiesContext();

  return (activity: WebChatActivity): Exclude<ReturnType<ActivityComponentFactory>, false> | undefined =>
    renderActivityCallbackMap.get(activity);
}
