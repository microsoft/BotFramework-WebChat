import { getActivityLivestreamingMetadata, type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo, type ReactNode } from 'react';

import {
  ActivityBorderDecoratorMiddlewareProxy,
  createActivityBorderMiddleware,
  type ActivityBorderDecoratorMiddlewareRequest
} from './private/ActivityBorderDecoratorMiddleware';
import ActivityBorderDecoratorRequestContext from './private/ActivityBorderDecoratorRequestContext';

const supportedActivityRoles: ActivityBorderDecoratorMiddlewareRequest['from'][] = [
  'bot',
  'channel',
  'user',
  undefined
];

type ActivityBorderDecoratorProps = Readonly<{
  activity?: WebChatActivity | undefined;
  children?: ReactNode | undefined;
}>;

function ActivityBorderDecorator({ activity, children }: ActivityBorderDecoratorProps) {
  const request = useMemo<ActivityBorderDecoratorMiddlewareRequest>(() => {
    const { type } = getActivityLivestreamingMetadata(activity) || {};

    return {
      from: supportedActivityRoles.includes(activity?.from?.role) ? activity?.from?.role : undefined,
      livestreamingState:
        type === 'final activity'
          ? 'completing'
          : type === 'informative message'
            ? 'preparing'
            : type === 'interim activity'
              ? 'ongoing'
              : type === 'contentless'
                ? undefined // No bubble is shown for "contentless" livestream, should not decorate.
                : undefined
    };
  }, [activity]);

  return <ActivityBorderDecoratorMiddlewareProxy request={request}>{children}</ActivityBorderDecoratorMiddlewareProxy>;
}

export default memo(ActivityBorderDecorator);
export { createActivityBorderMiddleware, type ActivityBorderDecoratorProps };
export { ActivityBorderDecoratorRequestContext as ActivityBorderDecoratorRequest };
