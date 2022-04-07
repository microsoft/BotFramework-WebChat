import { useMemo } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import { AvatarComponentFactory } from '../types/AvatarMiddleware';
import useStyleOptions from './useStyleOptions';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useCreateAvatarRenderer(): ({
  activity
}: {
  activity: WebChatActivity;
}) => AvatarComponentFactory {
  const [styleOptions] = useStyleOptions();
  const { avatarRenderer } = useWebChatAPIContext();

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
