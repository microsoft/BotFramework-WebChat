// We need to patch <AvatarPolymiddlewareProxy> from `api-middleware`.
//
// - Props of <AvatarPolymiddlewareProxy> should not need `styleOptions`
//   - We should call `useStyleOptions()` to get style options
// - However, `api-middleware` is before `api`, so it do not have access to `useStyleOptions`
//
// Until we have `api-style-options`, we have to patch <AvatarPolymiddlewareProxy> inside `api`.

import {
  __INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol,
  AvatarPolymiddlewareProxy as RawAvatarPolymiddlewareProxy
} from '@msinternal/botframework-webchat-api-middleware';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import type { WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { custom, object, pipe, readonly, safeParse, type InferInput } from 'valibot';
import { useStyleOptions } from '../hooks';

const avatarPolymiddlewareProxyPropsSchema = pipe(
  object({
    activity: custom<Readonly<WebChatActivity>>(value => safeParse(object({}), value).success)
  }),
  readonly()
);

type AvatarPolymiddlewareProxyProps = Readonly<InferInput<typeof avatarPolymiddlewareProxyPropsSchema>>;

const AvatarPolymiddlewareProxy = memo((props: AvatarPolymiddlewareProxyProps) => {
  const { activity } = validateProps(avatarPolymiddlewareProxyPropsSchema, props);

  const [styleOptions] = useStyleOptions();

  const rawProps = useMemo(
    () => ({
      [__INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol]: styleOptions
    }),
    [styleOptions]
  );

  return <RawAvatarPolymiddlewareProxy activity={activity} {...rawProps} />;
});

AvatarPolymiddlewareProxy.displayName = 'AvatarPolymiddlewareProxy';

export default AvatarPolymiddlewareProxy;
export { avatarPolymiddlewareProxyPropsSchema, type AvatarPolymiddlewareProxyProps };
