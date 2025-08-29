import { useMemoWithPrevious } from '@msinternal/botframework-webchat-react-hooks';
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

import { ActivityPolymiddlewareProvider, extractActivityEnhancer } from './activityPolymiddleware';
import { ErrorBoxPolymiddlewareProvider, extractErrorBoxEnhancer } from './errorBoxPolymiddleware';
import { Polymiddleware } from './types/Polymiddleware';

const polymiddlewareComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    polymiddleware: pipe(
      custom<readonly Polymiddleware[]>(value => safeParse(array(function_()), value).success),
      transform<readonly Polymiddleware[], readonly Polymiddleware[]>(value => Object.freeze(Array.from(value)))
    )
  }),
  readonly()
);

type PolymiddlewareComposerProps = Readonly<InferInput<typeof polymiddlewareComposerPropsSchema>>;

function PolymiddlewareComposer(props: PolymiddlewareComposerProps) {
  const { children, polymiddleware } = validateProps(polymiddlewareComposerPropsSchema, props);

  const activityEnhancers = useMemoWithPrevious<ReturnType<typeof extractActivityEnhancer>>(
    (prevActivityEnhancers = []) => {
      const activityEnhancers = extractActivityEnhancer(polymiddleware);

      // Checks for array equality, return previous version if nothing has changed.
      return prevActivityEnhancers.length === activityEnhancers.length &&
        activityEnhancers.every((middleware, index) => Object.is(middleware, prevActivityEnhancers.at(index)))
        ? prevActivityEnhancers
        : activityEnhancers;
    },
    [polymiddleware]
  );

  const activityPolymiddleware = useMemo(() => activityEnhancers.map(enhancer => () => enhancer), [activityEnhancers]);

  const errorBoxEnhancers = useMemoWithPrevious<ReturnType<typeof extractErrorBoxEnhancer>>(
    (prevErrorBoxEnhancers = []) => {
      const errorBoxEnhancers = extractErrorBoxEnhancer(polymiddleware);

      // Checks for array equality, return previous version if nothing has changed.
      return prevErrorBoxEnhancers.length === errorBoxEnhancers.length &&
        errorBoxEnhancers.every((middleware, index) => Object.is(middleware, prevErrorBoxEnhancers.at(index)))
        ? prevErrorBoxEnhancers
        : errorBoxEnhancers;
    },
    [polymiddleware]
  );

  const errorBoxPolymiddleware = useMemo(() => errorBoxEnhancers.map(enhancer => () => enhancer), [errorBoxEnhancers]);

  // Didn't thoroughly think through this part yet, but I am using the first approach for now:

  // 1. <XXXProvider> for every type of middleware
  //    - If props.middleware changed and only one middleware changed, we could cache other middleware types
  // 2. Single <Provider>
  //    - `useBuildRenderCallback()` should pre-build (apply) the callback (multiple middleware -> single enhancer)
  //    - The callback will be invalidated on middleware (of target type) change
  //    - <Proxy> will need to be rebuilt, as it uses a different `useBuildRenderCallback()`

  return (
    <ActivityPolymiddlewareProvider middleware={activityPolymiddleware}>
      <ErrorBoxPolymiddlewareProvider middleware={errorBoxPolymiddleware}>{children}</ErrorBoxPolymiddlewareProvider>
    </ActivityPolymiddlewareProvider>
  );
}

export default memo(PolymiddlewareComposer);
export { polymiddlewareComposerPropsSchema, type PolymiddlewareComposerProps };
