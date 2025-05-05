import React, { memo, useContext, useMemo, type ReactNode } from 'react';
import {
  ActivityBorderDecoratorMiddlewareProvider,
  initActivityBorderDecoratorMiddleware
} from '../ActivityBorder/private/ActivityBorderDecoratorMiddleware';
import { activityBorderDecoratorTypeName } from '../ActivityBorder/types';
import {
  ActivityGroupingDecoratorMiddlewareProvider,
  initActivityGroupingDecoratorMiddleware
} from '../ActivityGrouping/private/ActivityGroupingDecoratorMiddleware';
import { activityGroupingDecoratorTypeName } from '../ActivityGrouping/types';
import DecoratorComposerContext from '../private/DecoratorComposerContext';
import { type DecoratorMiddleware } from '../types';

type InternalDecoratorComposerProps = Readonly<{
  children?: ReactNode | undefined;
  middleware: readonly DecoratorMiddleware[];
  priority: 'low' | 'normal';
}>;

const EMPTY_ARRAY = Object.freeze([]);

function InternalDecoratorComposer({
  children,
  middleware: middlewareFromProps = EMPTY_ARRAY,
  priority
}: InternalDecoratorComposerProps) {
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

export default memo(InternalDecoratorComposer);
export { type InternalDecoratorComposerProps };
