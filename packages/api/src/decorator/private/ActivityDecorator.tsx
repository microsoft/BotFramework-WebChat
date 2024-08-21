import { getActivityLivestreamingType, type WebChatActivity } from 'botframework-webchat-core';
import React, { Fragment, memo, useMemo, type ReactNode } from 'react';
import { ActivityDecoratorRequest } from '..';
import { ActivityBorderDecoratorMiddlewareProxy } from './ActivityBorderDecoratorMiddleware';

const ActivityDecoratorFallback = memo(({ children }) => <Fragment>{children}</Fragment>);

ActivityDecoratorFallback.displayName = 'ActivityDecoratorFallback';

const supportedActivityRoles: ActivityDecoratorRequest['from'][] = ['bot', 'channel', 'user', undefined];

function ActivityDecorator({ activity, children }: Readonly<{ activity?: WebChatActivity; children?: ReactNode }>) {
  const request = useMemo<ActivityDecoratorRequest>(() => {
    const livestreamingType = getActivityLivestreamingType(activity);

    return {
      from: supportedActivityRoles.includes(activity?.from?.role) ? activity?.from?.role : undefined,
      livestreaming:
        livestreamingType === 'final activity'
          ? 'completing'
          : livestreamingType === 'informative message'
            ? 'informative message'
            : undefined
    };
  }, [activity]);

  return (
    <ActivityBorderDecoratorMiddlewareProxy fallbackComponent={ActivityDecoratorFallback} request={request}>
      {children}
    </ActivityBorderDecoratorMiddlewareProxy>
  );
}

export default memo(ActivityDecorator);
