import { type WebChatActivity } from 'botframework-webchat-core';
import React, { Fragment, memo, type ReactNode } from 'react';
import { ActivityBorderDecoratorMiddlewareProxy } from './private/ActivityBorderDecoratorMiddleware';
import useActivityDecoratorRequest from './private/useActivityDecoratorRequest';

const ActivityDecoratorFallback = memo(({ children }) => <Fragment>{children}</Fragment>);

ActivityDecoratorFallback.displayName = 'ActivityDecoratorFallback';

function ActivityDecorator({ activity, children }: Readonly<{ activity?: WebChatActivity; children?: ReactNode }>) {
  const request = useActivityDecoratorRequest(activity);

  return (
    <ActivityBorderDecoratorMiddlewareProxy fallbackComponent={ActivityDecoratorFallback} request={request}>
      {children}
    </ActivityBorderDecoratorMiddlewareProxy>
  );
}

export default memo(ActivityDecorator);
