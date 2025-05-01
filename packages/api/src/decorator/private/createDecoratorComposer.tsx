import React, { useContext, useMemo, type ReactNode } from 'react';
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
import DecoratorComposerContext from './DecoratorComposerContext';

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
  ({ children, middleware: middlewareFromProps = EMPTY_ARRAY }) => {
    const existingContext = useContext(DecoratorComposerContext);
    const middleware = useMemo(
      () => Object.freeze([...existingContext.middleware, ...middlewareFromProps]),
      [existingContext, middlewareFromProps]
    );

    const context = useMemo(() => ({ middleware }), [middleware]);

    const activityBorderMiddleware = useMemo(
      () => initActivityBorderDecoratorMiddleware(middleware, activityBorderDecoratorTypeName),
      [middleware]
    );

    const activityGroupingMiddleware = useMemo(
      () => initActivityGroupingDecoratorMiddleware(middleware, activityGroupingDecoratorTypeName),
      [middleware]
    );

    return (
      <DecoratorComposerContext.Provider value={context}>
        <ActivityBorderDecoratorMiddlewareProvider middleware={activityBorderMiddleware}>
          <ActivityGroupingDecoratorMiddlewareProvider middleware={activityGroupingMiddleware}>
            {children}
          </ActivityGroupingDecoratorMiddlewareProvider>
        </ActivityBorderDecoratorMiddlewareProvider>
      </DecoratorComposerContext.Provider>
    );
  };
