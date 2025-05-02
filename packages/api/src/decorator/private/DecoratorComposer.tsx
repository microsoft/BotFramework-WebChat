import React, { memo, useContext, useMemo, type ReactNode } from 'react';
import {
  ActivityBorderDecoratorMiddlewareProvider,
  activityBorderDecoratorTypeName,
  initActivityBorderDecoratorMiddleware
} from './ActivityBorderDecoratorMiddleware';
import {
  ActivityGroupingDecoratorMiddlewareProvider,
  activityGroupingDecoratorTypeName,
  initActivityGroupingDecoratorMiddleware
} from './ActivityGroupingDecoratorMiddleware';
import DecoratorComposerContext from './DecoratorComposerContext';
import { type DecoratorMiddleware } from './types';

type DecoratorComposerProps = Readonly<{
  children?: ReactNode | undefined;
  middleware?: readonly DecoratorMiddleware[];
  priority?: 'low' | 'normal' | undefined;
}>;

const EMPTY_ARRAY = [];

function DecoratorComposer({
  children,
  middleware: middlewareFromProps = EMPTY_ARRAY,
  priority
}: DecoratorComposerProps) {
  const existingContext = useContext(DecoratorComposerContext);
  const middleware = useMemo(
    () =>
      priority === 'low'
        ? Object.freeze([...existingContext.middleware, ...middlewareFromProps])
        : Object.freeze([...middlewareFromProps, ...existingContext.middleware]),
    [existingContext, middlewareFromProps, priority]
  );

  const activityBorderMiddleware = useMemo(
    () => initActivityBorderDecoratorMiddleware(middleware, activityBorderDecoratorTypeName),
    [middleware]
  );

  const activityGroupingMiddleware = useMemo(
    () => initActivityGroupingDecoratorMiddleware(middleware, activityGroupingDecoratorTypeName),
    [middleware]
  );

  const context = useMemo(() => ({ middleware }), [middleware]);

  return (
    <DecoratorComposerContext.Provider value={context}>
      <ActivityBorderDecoratorMiddlewareProvider middleware={activityBorderMiddleware}>
        <ActivityGroupingDecoratorMiddlewareProvider middleware={activityGroupingMiddleware}>
          {children}
        </ActivityGroupingDecoratorMiddlewareProvider>
      </ActivityBorderDecoratorMiddlewareProvider>
    </DecoratorComposerContext.Provider>
  );
}

export default memo(DecoratorComposer);
export { type DecoratorComposerProps };
