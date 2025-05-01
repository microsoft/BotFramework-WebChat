import React, { useMemo, type ReactNode } from 'react';
import {
  ActivityGroupingDecoratorMiddlewareProvider,
  activityGroupingDecoratorTypeName,
  initActivityGroupingDecoratorMiddleware,
  type ActivityGroupingDecoratorMiddleware
} from './private/ActivityGroupingDecoratorMiddleware';

type ActivityGroupingDecoratorMiddlewareInit = typeof activityGroupingDecoratorTypeName;

export type ActivityGroupingDecoratorMiddlewareWithInit = (
  init: ActivityGroupingDecoratorMiddlewareInit
) => ReturnType<ActivityGroupingDecoratorMiddleware> | false;

const EMPTY_ARRAY = Object.freeze([]);

type ActivityGroupingDecoratorComposerProps = Readonly<{
  children?: ReactNode | undefined;
  middleware?: readonly ActivityGroupingDecoratorMiddlewareWithInit[] | undefined;
}>;

const ActivityGroupingDecoratorComposer = ({
  children,
  middleware = EMPTY_ARRAY
}: ActivityGroupingDecoratorComposerProps) => {
  const activityGroupingMiddleware = useMemo(
    () => initActivityGroupingDecoratorMiddleware(middleware, activityGroupingDecoratorTypeName),
    [middleware]
  );

  return (
    <ActivityGroupingDecoratorMiddlewareProvider middleware={activityGroupingMiddleware}>
      {children}
    </ActivityGroupingDecoratorMiddlewareProvider>
  );
};

ActivityGroupingDecoratorComposer.displayName = 'ActivityGroupingDecoratorComposer';

export default ActivityGroupingDecoratorComposer;
export { type ActivityGroupingDecoratorComposerProps };
