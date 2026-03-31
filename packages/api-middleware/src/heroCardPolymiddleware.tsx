import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useMemo } from 'react';
import { object, pipe, readonly, type InferInput } from 'valibot';

import templatePolymiddleware, {
  type InferHandler,
  type InferHandlerResult,
  type InferMiddleware,
  type InferProps,
  type InferProviderProps,
  type InferRenderer,
  type InferRequest
} from './private/templatePolymiddleware';

const {
  createMiddleware: createHeroCardPolymiddleware,
  extractEnhancer: extractHeroCardEnhancer,
  Provider: HeroCardPolymiddlewareProvider,
  Proxy,
  reactComponent: heroCardComponent,
  useBuildRenderCallback: useBuildRenderHeroCardCallback
} = templatePolymiddleware<{ readonly heroCard: unknown }, { readonly children?: never }>('HeroCard');

type HeroCardPolymiddleware = InferMiddleware<typeof HeroCardPolymiddlewareProvider>;
type HeroCardPolymiddlewareHandler = InferHandler<typeof HeroCardPolymiddlewareProvider>;
type HeroCardPolymiddlewareHandlerResult = InferHandlerResult<typeof HeroCardPolymiddlewareProvider>;
type HeroCardPolymiddlewareProps = InferProps<typeof HeroCardPolymiddlewareProvider>;
type HeroCardPolymiddlewareRenderer = InferRenderer<typeof HeroCardPolymiddlewareProvider>;
type HeroCardPolymiddlewareRequest = InferRequest<typeof HeroCardPolymiddlewareProvider>;
type HeroCardPolymiddlewareProviderProps = InferProviderProps<typeof HeroCardPolymiddlewareProvider>;

const HeroCardPolymiddlewareProxyPropsSchema = pipe(
  object({
    heroCard: object({})
  }),
  readonly()
);

type HeroCardPolymiddlewareProxyProps = Readonly<InferInput<typeof HeroCardPolymiddlewareProxyPropsSchema>>;

// A friendlier version than the organic <Proxy>.
const HeroCardPolymiddlewareProxy = memo(function HeroCardPolymiddlewareProxy(props: HeroCardPolymiddlewareProxyProps) {
  const { heroCard } = validateProps(HeroCardPolymiddlewareProxyPropsSchema, props);

  const request = useMemo(() => ({ heroCard }), [heroCard]);

  return <Proxy request={request} />;
});

export {
  createHeroCardPolymiddleware,
  extractHeroCardEnhancer,
  heroCardComponent,
  HeroCardPolymiddlewareProvider,
  HeroCardPolymiddlewareProxy,
  useBuildRenderHeroCardCallback,
  type HeroCardPolymiddleware,
  type HeroCardPolymiddlewareHandler,
  type HeroCardPolymiddlewareHandlerResult,
  type HeroCardPolymiddlewareProps,
  type HeroCardPolymiddlewareProviderProps,
  type HeroCardPolymiddlewareProxyProps,
  type HeroCardPolymiddlewareRenderer,
  type HeroCardPolymiddlewareRequest
};
