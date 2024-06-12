import React, { type ReactNode, memo, useMemo } from 'react';
import { ActivityBorderDecoratorMiddlewareProxy } from './ActivityBorderDecoratorMiddleware';
import { WebChatActivity } from 'botframework-webchat-core';
import { ActivityDecoratorRequest } from '..';

const ActivityDecoratorFallback = memo(({ children }) => <React.Fragment>{children}</React.Fragment>);

function ActivityDecorator({ children, activity }: Readonly<{ activity?: WebChatActivity; children?: ReactNode }>) {
  const request = useMemo<ActivityDecoratorRequest>(
    () =>
      activity && {
        from: activity.from?.role === 'bot' ? 'bot' : activity.from?.role === 'channel' ? 'channel' ? activity.from?.role === 'user' ? 'user' : undefined,
        state:
          activity.channelData.streamType === 'informative'
            ? 'informative'
            : activity.channelData.streamType === 'completion'
              ? 'completion'
              : undefined
      },
    [activity]
  );
  return request ? (
    <ActivityBorderDecoratorMiddlewareProxy fallbackComponent={ActivityDecoratorFallback} request={request}>
      {children}
    </ActivityBorderDecoratorMiddlewareProxy>
  ) : (
    <React.Fragment>{children}</React.Fragment>
  );
}

export default memo(ActivityDecorator);
