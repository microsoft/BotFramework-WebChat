// We need to patch `useBuildRenderAvatarCallback()` from `api-middleware`.
//
// - Request of `useBuildRenderAvatarCallback()` should not need `styleOptions`
//   - We should call `useStyleOptions()` to get style options
// - However, `api-middleware` is before `api`, so it do not have access to `useStyleOptions`
//
// Until we have `api-style-options`, we have to patch `useBuildRenderAvatarCallback()` inside `api`.

import {
  __INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol,
  useBuildRenderAvatarCallback as useBuildRenderAvatarCallbackRaw
} from '@msinternal/botframework-webchat-api-middleware';
import type { WebChatActivity } from 'botframework-webchat-core';
import { useCallback } from 'react';
import type { ComponentRenderer } from 'react-chain-of-responsibility/preview';
import { useRefFrom } from 'use-ref-from';
import { useStyleOptions } from '../hooks';

export default function useBuildRenderAvatarCallback(): (request: {
  readonly activity: WebChatActivity;
}) => ComponentRenderer<{ children?: never }> {
  const [styleOptions] = useStyleOptions();

  const renderAvatar = useBuildRenderAvatarCallbackRaw();
  const styleOptionsRef = useRefFrom(styleOptions);

  return useCallback<(request: { readonly activity: WebChatActivity }) => ReturnType<typeof renderAvatar>>(
    request =>
      renderAvatar(
        Object.freeze({
          activity: request.activity,
          [__INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol]: styleOptionsRef.current
        })
      ),
    [renderAvatar, styleOptionsRef]
  );
}
