import React, { type ReactNode, useMemo } from 'react';
import {
  ActivityBorderDecoratorMiddlewareProvider,
  activityBorderDecoratorTypeName,
  type ActivityBorderDecoratorMiddleware
} from './ActivityBorderDecoratorMiddleware';

type DecoratorMiddlewareByInit = {
  [activityBorderDecoratorTypeName]: ActivityBorderDecoratorMiddleware;
};

type DecoratorMiddlewareInit = keyof DecoratorMiddlewareByInit;

export type DecoratorComposerComponent = (
  props: Readonly<{
    children: ReactNode;
    middleware: DecoratorMiddleware[];
  }>
) => React.JSX.Element;

export type DecoratorMiddleware = (
  init: DecoratorMiddlewareInit
) => ReturnType<ActivityBorderDecoratorMiddleware> | false;

const initMiddlewares = <Init extends DecoratorMiddlewareInit>(
  middleware: DecoratorMiddleware[],
  init: Init
): DecoratorMiddlewareByInit[Init][] =>
  middleware
    .map(md => md(init))
    .filter((enhancer): enhancer is ReturnType<DecoratorMiddlewareByInit[Init]> => !!enhancer)
    .map(enhancer => () => enhancer);

export default (): DecoratorComposerComponent =>
  ({ children, middleware }) => {
    const borderMiddlewares = useMemo(() => initMiddlewares(middleware, activityBorderDecoratorTypeName), [middleware]);

    return (
      <ActivityBorderDecoratorMiddlewareProvider middleware={borderMiddlewares}>
        {children}
      </ActivityBorderDecoratorMiddlewareProvider>
    );
  };
