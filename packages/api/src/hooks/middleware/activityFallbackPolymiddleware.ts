import { type WebChatActivity } from 'botframework-webchat-core';
import { memo } from 'react';

import { activityComponent, createActivityPolymiddleware } from '../../package-api-middleware/index';

// eslint-disable-next-line prefer-arrow-callback
const NoActivityToRenderComponent = memo(function NoActivityToRenderComponent({
  activity
}: {
  readonly activity: WebChatActivity;
  children?: never;
}) {
  throw new Error(`No renderer for activity of type "${activity.type}"`);
});

const activityFallbackPolymiddleware = createActivityPolymiddleware(
  () =>
    ({ activity }) =>
      activityComponent<{ readonly activity: WebChatActivity; children?: never }>(NoActivityToRenderComponent, {
        activity
      })
);

export default activityFallbackPolymiddleware;
