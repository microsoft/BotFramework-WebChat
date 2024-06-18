import React, { useMemo, type ReactNode } from 'react';
import {
  ActivityBorderDecoratorMiddlewareProvider,
  activityBorderDecoratorTypeName,
  initActivityBorderDecoratorMiddleware,
  type ActivityBorderDecoratorMiddleware
} from './ActivityBorderDecoratorMiddleware';

type DecoratorMiddlewareInit = typeof activityBorderDecoratorTypeName;

export type DecoratorComposerComponent = (
  props: Readonly<{
    children?: ReactNode;
    middleware?: DecoratorMiddleware[];
  }>
) => React.JSX.Element;

export type DecoratorMiddleware = (
  init: DecoratorMiddlewareInit
) => ReturnType<ActivityBorderDecoratorMiddleware> | false;

const EMPTY_ARRAY = [];

export default (): DecoratorComposerComponent =>
  ({ children, middleware = EMPTY_ARRAY }) => {
    const borderMiddlewares = useMemo(
      () => initActivityBorderDecoratorMiddleware(middleware, activityBorderDecoratorTypeName),
      [middleware]
    );

    return (
      <ActivityBorderDecoratorMiddlewareProvider middleware={borderMiddlewares}>
        {children}
      </ActivityBorderDecoratorMiddlewareProvider>
    );
  };
