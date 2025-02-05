import React, { useMemo, type ReactNode } from 'react';
import {
  ActivityBorderDecoratorMiddlewareProvider,
  activityBorderDecoratorTypeName,
  initActivityBorderDecoratorMiddleware,
  type ActivityBorderDecoratorMiddleware
} from './ActivityBorderDecoratorMiddleware';
import {
  ActivityActionsDecoratorMiddleware,
  ActivityActionsDecoratorMiddlewareProvider,
  activityActionsDecoratorTypeName,
  initActivityActionsDecoratorMiddleware
} from './ActivityActionsDecoratorMiddleware';

export type DecoratorComposerComponent = (
  props: Readonly<{
    children?: ReactNode | undefined;
    middleware?: readonly DecoratorMiddleware[] | undefined;
  }>
) => React.JSX.Element;

export type DecoratorMiddleware =
  | ((init: typeof activityBorderDecoratorTypeName) => ReturnType<ActivityBorderDecoratorMiddleware> | false)
  | ((init: typeof activityActionsDecoratorTypeName) => ReturnType<ActivityActionsDecoratorMiddleware> | false);

const EMPTY_ARRAY = [] as DecoratorMiddleware[];

export default (): DecoratorComposerComponent =>
  ({ children, middleware = EMPTY_ARRAY }) => {
    const borderMiddlewares = useMemo(
      () => initActivityBorderDecoratorMiddleware(middleware, activityBorderDecoratorTypeName),
      [middleware]
    );

    const actionsMiddlewares = useMemo(
      () => initActivityActionsDecoratorMiddleware(middleware, activityActionsDecoratorTypeName),
      [middleware]
    );

    return (
      <ActivityBorderDecoratorMiddlewareProvider middleware={borderMiddlewares}>
        <ActivityActionsDecoratorMiddlewareProvider middleware={actionsMiddlewares}>
          {children}
        </ActivityActionsDecoratorMiddlewareProvider>
      </ActivityBorderDecoratorMiddlewareProvider>
    );
  };
