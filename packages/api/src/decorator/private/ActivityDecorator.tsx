import { getActivityLivestreamingMetadata, type WebChatActivity } from 'botframework-webchat-core';
import React, { Fragment, memo, useMemo, type ReactNode } from 'react';
import { ActivityDecoratorRequest } from '..';
import { ActivityBorderDecoratorMiddlewareProxy } from './ActivityBorderDecoratorMiddleware';

const ActivityDecoratorFallback = memo(({ children }) => <Fragment>{children}</Fragment>);

ActivityDecoratorFallback.displayName = 'ActivityDecoratorFallback';

const supportedActivityRoles: ActivityDecoratorRequest['from'][] = ['bot', 'channel', 'user', undefined];

function ActivityDecorator({ activity, children }: Readonly<{ activity?: WebChatActivity; children?: ReactNode }>) {
  const request = useMemo<ActivityDecoratorRequest>(() => {
    const type = getActivityLivestreamingMetadata(activity)?.type;

    return {
      decorateForLivestreaming:
        type === 'final activity' ? 'completing' : type === 'informative message' ? 'informative message' : undefined,
      from: supportedActivityRoles.includes(activity?.from?.role) ? activity?.from?.role : undefined
    };
  }, [activity]);

  return (
    <ActivityBorderDecoratorMiddlewareProxy fallbackComponent={ActivityDecoratorFallback} request={request}>
      {children}
    </ActivityBorderDecoratorMiddlewareProxy>
  );
}

export default memo(ActivityDecorator);
