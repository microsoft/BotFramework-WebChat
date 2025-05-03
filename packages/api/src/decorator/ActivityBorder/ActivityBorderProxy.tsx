import { getActivityLivestreamingMetadata, type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo, type ReactNode } from 'react';
import PassthroughFallback from '../private/PassthroughFallback';
import {
  ActivityBorderDecoratorMiddlewareProxy,
  type ActivityBorderDecoratorMiddlewareRequest
} from './private/ActivityBorderDecoratorMiddleware';

const supportedActivityRoles: ActivityBorderDecoratorMiddlewareRequest['from'][] = [
  'bot',
  'channel',
  'user',
  undefined
];

type ActivityBorderDecoratorProxyProps = Readonly<{
  activity?: WebChatActivity | undefined;
  children?: ReactNode | undefined;
}>;

function ActivityBorderDecoratorProxy({ activity, children }: ActivityBorderDecoratorProxyProps) {
  const request = useMemo<ActivityBorderDecoratorMiddlewareRequest>(() => {
    const { type } = getActivityLivestreamingMetadata(activity) || {};

    return {
      livestreamingState:
        type === 'final activity'
          ? 'completing'
          : type === 'informative message'
            ? 'preparing'
            : type === 'interim activity'
              ? 'ongoing'
              : type === 'contentless'
                ? undefined // No bubble is shown for "contentless" livestream, should not decorate.
                : undefined,
      from: supportedActivityRoles.includes(activity?.from?.role) ? activity?.from?.role : undefined
    };
  }, [activity]);

  return (
    <ActivityBorderDecoratorMiddlewareProxy fallbackComponent={PassthroughFallback} request={request}>
      {children}
    </ActivityBorderDecoratorMiddlewareProxy>
  );
}

export default memo(ActivityBorderDecoratorProxy);
export { type ActivityBorderDecoratorProxyProps as ActivityBorderDecoratorProps };
