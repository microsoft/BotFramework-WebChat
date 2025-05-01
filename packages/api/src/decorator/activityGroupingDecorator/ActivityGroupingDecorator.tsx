import { type WebChatActivity } from 'botframework-webchat-core';
import React, { Fragment, memo, useMemo, type ReactNode } from 'react';
import { ActivityGroupingDecoratorMiddlewareProxy } from './private/ActivityGroupingDecoratorMiddleware';

const ActivityGroupingDecoratorFallback = memo(({ children }) => <Fragment>{children}</Fragment>);

ActivityGroupingDecoratorFallback.displayName = 'ActivityGroupingDecoratorFallback';

type ActivityGroupingDecoratorProps = Readonly<{
  activities: readonly WebChatActivity[];
  children?: ReactNode | undefined;
  type: string;
}>;

const ActivityGroupingDecorator = ({ activities, children, type }: ActivityGroupingDecoratorProps) => {
  const request = useMemo(() => ({ type }), [type]);

  return (
    <ActivityGroupingDecoratorMiddlewareProxy
      activities={activities}
      fallbackComponent={ActivityGroupingDecoratorFallback}
      request={request}
    >
      {children}
    </ActivityGroupingDecoratorMiddlewareProxy>
  );
};

ActivityGroupingDecorator.displayName = 'ActivityGroupingDecorator';

export default memo(ActivityGroupingDecorator);
export { type ActivityGroupingDecoratorProps };
