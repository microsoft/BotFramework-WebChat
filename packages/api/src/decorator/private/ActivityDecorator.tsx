import { WebChatActivity } from 'botframework-webchat-core';
import React, { Fragment, memo, useMemo, type ReactNode } from 'react';
import { ActivityDecoratorRequest } from '..';
import { ActivityBorderDecoratorMiddlewareProxy } from './ActivityBorderDecoratorMiddleware';

const ActivityDecoratorFallback = memo(({ children }) => <Fragment>{children}</Fragment>);

ActivityDecoratorFallback.displayName = 'ActivityDecoratorFallback';

const supportedActivityRoles: ActivityDecoratorRequest['from'][] = ['bot', 'channel', 'user', undefined];
const supportedActivityStates: ActivityDecoratorRequest['state'][] = ['informative', 'completion', undefined];

function ActivityDecorator({ children, activity }: Readonly<{ activity?: WebChatActivity; children?: ReactNode }>) {
  const request = useMemo<ActivityDecoratorRequest>(
    () => ({
      from: supportedActivityRoles.includes(activity?.from?.role) ? activity?.from?.role : undefined,
      state: supportedActivityStates.includes(activity?.channelData?.streamType)
        ? activity?.channelData?.streamType
        : undefined
    }),
    [activity]
  );

  return (
    <ActivityBorderDecoratorMiddlewareProxy fallbackComponent={ActivityDecoratorFallback} request={request}>
      {children}
    </ActivityBorderDecoratorMiddlewareProxy>
  );
}

export default memo(ActivityDecorator);
