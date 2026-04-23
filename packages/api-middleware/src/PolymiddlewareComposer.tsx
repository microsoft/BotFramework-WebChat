import { useMemoIterable } from '@msinternal/botframework-webchat-react-hooks';
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
import { AvatarPolymiddlewareProvider, extractAvatarEnhancer } from './avatarPolymiddleware';
import { ErrorBoxPolymiddlewareProvider, extractErrorBoxEnhancer } from './errorBoxPolymiddleware';
import { extractHeroCardEnhancer, HeroCardPolymiddlewareProvider } from './heroCardPolymiddleware';
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

  const activityEnhancers = useMemoIterable<ReturnType<typeof extractActivityEnhancer>>(
    () => extractActivityEnhancer(polymiddleware),
    [polymiddleware]
  );

  const activityPolymiddleware = useMemo(() => activityEnhancers.map(enhancer => () => enhancer), [activityEnhancers]);

  const avatarEnhancers = useMemoIterable<ReturnType<typeof extractAvatarEnhancer>>(
    () => extractAvatarEnhancer(polymiddleware),
    [polymiddleware]
  );

  const avatarPolymiddleware = useMemo(() => avatarEnhancers.map(enhancer => () => enhancer), [avatarEnhancers]);

  const errorBoxEnhancers = useMemoIterable<ReturnType<typeof extractErrorBoxEnhancer>>(
    () => extractErrorBoxEnhancer(polymiddleware),
    [polymiddleware]
  );

  const errorBoxPolymiddleware = useMemo(() => errorBoxEnhancers.map(enhancer => () => enhancer), [errorBoxEnhancers]);

  const heroCardEnhancers = useMemoIterable<ReturnType<typeof extractHeroCardEnhancer>>(
    () => extractHeroCardEnhancer(polymiddleware),
    [polymiddleware]
  );

  const heroCardPolymiddleware = useMemo(() => heroCardEnhancers.map(enhancer => () => enhancer), [heroCardEnhancers]);

  // Didn't thoroughly think through this part yet, but I am using the first approach for now:

  // 1. <XXXProvider> for every type of middleware
  //    - If props.middleware changed and only one middleware changed, we could cache other middleware types
  // 2. Single <Provider>
  //    - `useBuildRenderCallback()` should pre-build (apply) the callback (multiple middleware -> single enhancer)
  //    - The callback will be invalidated on middleware (of target type) change
  //    - <Proxy> will need to be rebuilt, as it uses a different `useBuildRenderCallback()`

  return (
    <ErrorBoxPolymiddlewareProvider middleware={errorBoxPolymiddleware}>
      <ActivityPolymiddlewareProvider middleware={activityPolymiddleware}>
        <AvatarPolymiddlewareProvider middleware={avatarPolymiddleware}>
          <HeroCardPolymiddlewareProvider middleware={heroCardPolymiddleware}>
            {children}
          </HeroCardPolymiddlewareProvider>
        </AvatarPolymiddlewareProvider>
      </ActivityPolymiddlewareProvider>
    </ErrorBoxPolymiddlewareProvider>
  );
}

PolymiddlewareComposer.displayName = 'PolymiddlewareComposer';

export default memo(PolymiddlewareComposer);
export { polymiddlewareComposerPropsSchema, type PolymiddlewareComposerProps };
