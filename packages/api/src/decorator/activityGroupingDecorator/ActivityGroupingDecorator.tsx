import { type WebChatActivity } from 'botframework-webchat-core';
import React, { Fragment, memo, useMemo, type ReactNode } from 'react';
import { type ActivityComponentFactory } from '../../types/ActivityMiddleware';
import { ActivityGroupingDecoratorMiddlewareProxy } from './private/ActivityGroupingDecoratorMiddleware';

const ActivityGroupingDecoratorFallback = memo(({ children }) => <Fragment>{children}</Fragment>);

ActivityGroupingDecoratorFallback.displayName = 'ActivityGroupingDecoratorFallback';

type ActivityGroupingDecoratorProps = Readonly<{
  activities: readonly WebChatActivity[];
  activitiesWithRenderer: readonly Readonly<{
    activity: WebChatActivity;
    renderActivity: Exclude<ReturnType<ActivityComponentFactory>, false>;
  }>[];
  children?: ReactNode | undefined;
  type: string;
}>;

const ActivityGroupingDecorator = ({
  activities,
  activitiesWithRenderer,
  children,
  type
}: ActivityGroupingDecoratorProps) => {
  const request = useMemo(() => ({ type }), [type]);

  return (
    <ActivityGroupingDecoratorMiddlewareProxy
      activities={activities}
      activitiesWithRenderer={activitiesWithRenderer}
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
