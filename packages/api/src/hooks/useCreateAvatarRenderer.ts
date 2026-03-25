import {
  __INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol,
  useBuildRenderAvatarCallback
} from '@msinternal/botframework-webchat-api-middleware';
import type { WebChatActivity } from 'botframework-webchat-core';
import { useCallback, type ReactNode } from 'react';
import { useRefFrom } from 'use-ref-from';
import useStyleOptions from './useStyleOptions';

type CreateAvatarRendererCallback = ({
  activity
}: {
  activity: WebChatActivity;
}) => false | (() => Exclude<ReactNode, boolean | null | undefined>);

/**
 * @deprecated Use `<AvatarPolymiddlewareProxy>` or `useBuildRenderAvatarCallback` instead. This hook will be removed on or after 2028-03-16.
 */
export default function useCreateAvatarRenderer(): CreateAvatarRendererCallback {
  const [styleOptions] = useStyleOptions();
  const buildRenderAvatar = useBuildRenderAvatarCallback();

  const styleOptionsRef = useRefFrom(styleOptions);

  // TODO: [P1] We should move this function into `api-middleware`.
  //       However, it use `useStyleOptions` which is from `api` package.
  //       In order to do that, we need to build a new `api-style-options` package first.
  return useCallback<CreateAvatarRendererCallback>(
    ({ activity }) => {
      const renderer = buildRenderAvatar(
        Object.freeze({
          activity,
          [__INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol]: styleOptionsRef.current
        })
      );

      return renderer ? (): ReactNode => renderer({}) : false;
    },
    [buildRenderAvatar, styleOptionsRef]
  );
}
