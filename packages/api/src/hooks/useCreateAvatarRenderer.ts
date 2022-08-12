import { useMemo } from 'react';
import useStyleOptions from './useStyleOptions';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

import type { AvatarComponentFactory } from '../types/AvatarMiddleware';
import type { ReactNode } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

export default function useCreateAvatarRenderer(): ({
  activity
}: {
  activity: WebChatActivity;
}) => false | (() => Exclude<ReactNode, boolean | null | undefined>) {
  const [styleOptions] = useStyleOptions();
  const { avatarRenderer }: { avatarRenderer: AvatarComponentFactory } = useWebChatAPIContext();

  return useMemo(
    () =>
      ({ activity }) => {
        const { from: { role } = {} }: { from?: { role?: string } } = activity;

        const result = avatarRenderer({
          activity,
          fromUser: role === 'user',
          styleOptions
        });

        if (result !== false && typeof result !== 'function') {
          console.warn(
            'botframework-webchat: avatarMiddleware should return a function to render the avatar, or return false if avatar should be hidden. Please refer to HOOKS.md for details.'
          );

          return () => result;
        }

        return result;
      },
    [avatarRenderer, styleOptions]
  );
}
