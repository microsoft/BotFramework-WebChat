import React, { useMemo, type ReactNode } from 'react';
import {
  ActivityBorderDecoratorMiddlewareProvider,
  activityBorderDecoratorTypeName,
  initActivityBorderDecoratorMiddleware,
  type ActivityBorderDecoratorMiddleware
} from './ActivityBorderDecoratorMiddleware';
import {
  ActivityGroupingDecoratorMiddlewareProvider,
  activityGroupingDecoratorTypeName,
  initActivityGroupingDecoratorMiddleware,
  type ActivityGroupingDecoratorMiddleware
} from './ActivityGroupingDecoratorMiddleware';

export type DecoratorComposerComponent = (
  props: Readonly<{
    children?: ReactNode | undefined;
    middleware?: readonly DecoratorMiddleware[] | undefined;
  }>
) => React.JSX.Element;

export type DecoratorMiddlewareTypes = {
  [activityBorderDecoratorTypeName]: ReturnType<ActivityBorderDecoratorMiddleware>;
  [activityGroupingDecoratorTypeName]: ReturnType<ActivityGroupingDecoratorMiddleware>;
};

export type DecoratorMiddlewareInit = keyof DecoratorMiddlewareTypes;

export type DecoratorMiddleware = {
  [K in keyof DecoratorMiddlewareTypes]: (init: K) => DecoratorMiddlewareTypes[K] | false;
}[keyof DecoratorMiddlewareTypes];

const EMPTY_ARRAY = [];

export default (): DecoratorComposerComponent =>
  ({ children, middleware = EMPTY_ARRAY }) => {
    const borderMiddlewares = useMemo(
      () => initActivityBorderDecoratorMiddleware(middleware, activityBorderDecoratorTypeName),
      [middleware]
    );

    const activityGroupingMiddlewares = useMemo(
      () => initActivityGroupingDecoratorMiddleware(middleware, activityGroupingDecoratorTypeName),
      [middleware]
    );

    return (
      <ActivityBorderDecoratorMiddlewareProvider middleware={borderMiddlewares}>
        <ActivityGroupingDecoratorMiddlewareProvider middleware={activityGroupingMiddlewares}>
          {children}
        </ActivityGroupingDecoratorMiddlewareProvider>
      </ActivityBorderDecoratorMiddlewareProvider>
    );
  };
