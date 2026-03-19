import {
  __INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol,
  useBuildRenderAvatarCallback
} from '@msinternal/botframework-webchat-api-middleware';
import type { WebChatActivity } from 'botframework-webchat-core';
import { useMemo, type ReactNode } from 'react';
import useStyleOptions from './useStyleOptions';

/**
 * @deprecated Use `<AvatarPolymiddlewareProxy>` or `useBuildRenderAvatarCallback` instead. This hook will be removed on or after 2028-03-16.
 */
export default function useCreateAvatarRenderer(): ({
  activity
}: {
  activity: WebChatActivity;
}) => false | (() => Exclude<ReactNode, boolean | null | undefined>) {
  const [styleOptions] = useStyleOptions();
  const buildRenderAvatar = useBuildRenderAvatarCallback();

  return useMemo(
    () =>
      ({ activity }) => {
        const { from: { role } = {} }: { from?: { role?: string } } = activity;

        const renderer = buildRenderAvatar(
          Object.freeze({
            activity,
            fromUser: role === 'user',
            [__INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol]: styleOptions
          })
        );

        return renderer ? (): ReactNode => renderer({}) : false;
      },
    [buildRenderAvatar, styleOptions]
  );
}
