import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { any, custom, object, pipe, readonly, safeParse, type InferInput } from 'valibot';

import templatePolymiddleware, {
  type InferHandler,
  type InferHandlerResult,
  type InferMiddleware,
  type InferProps,
  type InferProviderProps,
  type InferRenderer,
  type InferRequest
} from './private/templatePolymiddleware';

// This is for bridging legacy AvatarMiddleware, will be removed when AvatarMiddleware is removed.
// Customization developers should request access to styleOptions themselves someway, says, `polymiddleware={[createCustomAvatarPolymiddleware(styleOptions)]}`.
const __INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol = Symbol();

const {
  createMiddleware: createAvatarPolymiddleware,
  extractEnhancer: extractAvatarEnhancer,
  Provider: AvatarPolymiddlewareProvider,
  Proxy,
  reactComponent: avatarComponent,
  useBuildRenderCallback: useBuildRenderAvatarCallback
} = templatePolymiddleware<
  {
    // TODO: The `styleOptions` is only for legacy middleware.
    readonly [__INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol]: any;
    readonly activity: WebChatActivity;
  },
  { readonly children?: never }
>('avatar');

type AvatarPolymiddleware = InferMiddleware<typeof AvatarPolymiddlewareProvider>;
type AvatarPolymiddlewareHandler = InferHandler<typeof AvatarPolymiddlewareProvider>;
type AvatarPolymiddlewareHandlerResult = InferHandlerResult<typeof AvatarPolymiddlewareProvider>;
type AvatarPolymiddlewareProps = InferProps<typeof AvatarPolymiddlewareProvider>;
type AvatarPolymiddlewareRenderer = InferRenderer<typeof AvatarPolymiddlewareProvider>;
type AvatarPolymiddlewareRequest = InferRequest<typeof AvatarPolymiddlewareProvider>;
type AvatarPolymiddlewareProviderProps = InferProviderProps<typeof AvatarPolymiddlewareProvider>;

const avatarPolymiddlewareProxyPropsSchema = pipe(
  object({
    [__INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol]: any(),
    activity: custom<Readonly<WebChatActivity>>(value => safeParse(object({}), value).success)
  }),
  readonly()
);

type AvatarPolymiddlewareProxyProps = Readonly<InferInput<typeof avatarPolymiddlewareProxyPropsSchema>>;

// A friendlier version than the organic <Proxy>.
const AvatarPolymiddlewareProxy = memo(function AvatarPolymiddlewareProxy(props: AvatarPolymiddlewareProxyProps) {
  const { [__INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol]: styleOptions, activity } =
    validateProps(avatarPolymiddlewareProxyPropsSchema, props);

  const request = useMemo(
    () =>
      Object.freeze({
        [__INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol]: styleOptions,
        activity
      }),
    [activity, styleOptions]
  );

  return <Proxy request={request} />;
});

export {
  __INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol,
  avatarComponent,
  AvatarPolymiddlewareProvider,
  AvatarPolymiddlewareProxy,
  createAvatarPolymiddleware,
  extractAvatarEnhancer,
  useBuildRenderAvatarCallback,
  type AvatarPolymiddleware,
  type AvatarPolymiddlewareHandler,
  type AvatarPolymiddlewareHandlerResult,
  type AvatarPolymiddlewareProps,
  type AvatarPolymiddlewareProviderProps,
  type AvatarPolymiddlewareProxyProps,
  type AvatarPolymiddlewareRenderer,
  type AvatarPolymiddlewareRequest
};
