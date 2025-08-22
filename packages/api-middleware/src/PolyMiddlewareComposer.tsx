import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useMemo } from 'react';
import {
  array,
  custom,
  function_,
  object,
  optional,
  pipe,
  readonly,
  safeParse,
  transform,
  type InferInput
} from 'valibot';

import { ActivityPolyMiddlewareProvider, extractActivityEnhancer } from './activityPolyMiddleware';
import useMemoWithPrevious from './internal/useMemoWithPrevious';
import { PolyMiddleware } from './types/PolyMiddleware';

const polyMiddlewareComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    middleware: pipe(
      custom<readonly PolyMiddleware[]>(value => safeParse(array(function_()), value).success),
      transform<readonly PolyMiddleware[], readonly PolyMiddleware[]>(value => Object.freeze(Array.from(value)))
    )
  }),
  readonly()
);

type PolyMiddlewareComposerProps = Readonly<InferInput<typeof polyMiddlewareComposerPropsSchema>>;

function PolyMiddlewareComposer(props: PolyMiddlewareComposerProps) {
  const { children, middleware } = validateProps(polyMiddlewareComposerPropsSchema, props);

  const activityEnhancers = useMemoWithPrevious<ReturnType<typeof extractActivityEnhancer>>(
    (prevActivityEnhancers = []) => {
      const activityEnhancers = extractActivityEnhancer(middleware);

      // Checks for array equality, return previous version if nothing has changed.
      return prevActivityEnhancers.length === activityEnhancers.length &&
        activityEnhancers.every((middleware, index) => Object.is(middleware, prevActivityEnhancers.at(index)))
        ? prevActivityEnhancers
        : activityEnhancers;
    },
    [middleware]
  );

  const activityPolyMiddleware = useMemo(() => activityEnhancers.map(enhancer => () => enhancer), [activityEnhancers]);

  // Didn't thoroughly think through this part yet, but I am using the first approach for now:

  // 1. <XXXProvider> for every type of middleware
  //    - If props.middleware changed and only one middleware changed, we could cache other middleware types
  // 2. Single <Provider>
  //    - `useBuildRenderCallback()` should pre-build (apply) the callback (multiple middleware -> single enhancer)
  //    - The callback will be invalidated on middleware (of target type) change
  //    - <Proxy> will need to be rebuilt, as it use a different `useBuildRenderCallback()`

  return (
    <ActivityPolyMiddlewareProvider middleware={activityPolyMiddleware}>{children}</ActivityPolyMiddlewareProvider>
  );
}

export default memo(PolyMiddlewareComposer);
export { polyMiddlewareComposerPropsSchema, type PolyMiddlewareComposerProps };
