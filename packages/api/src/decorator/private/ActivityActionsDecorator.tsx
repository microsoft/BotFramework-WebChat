import { type WebChatActivity } from 'botframework-webchat-core';
import React, { Fragment, memo, type ReactNode } from 'react';
import { ActivityActionsDecoratorMiddlewareProxy } from './ActivityActionsDecoratorMiddleware';
import useActivityDecoratorRequest from './useActivityDecoratorRequest';

const ActivityActionsDecoratorFallback = memo(({ children }) => <Fragment>{children}</Fragment>);

ActivityActionsDecoratorFallback.displayName = 'ActivityActionsDecoratorFallback';

function ActivityActionsDecorator({
  activity,
  children
}: Readonly<{ activity?: WebChatActivity; children?: ReactNode }>) {
  const request = useActivityDecoratorRequest(activity);

  return (
    <ActivityActionsDecoratorMiddlewareProxy fallbackComponent={ActivityActionsDecoratorFallback} request={request}>
      {children}
    </ActivityActionsDecoratorMiddlewareProxy>
  );
}

export default memo(ActivityActionsDecorator);
