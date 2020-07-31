import { useMemo } from 'react';

import useStyleOptions from './useStyleOptions';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useCreateAvatarRenderer() {
  const [styleOptions] = useStyleOptions();
  const { avatarRenderer } = useWebChatUIContext();

  return useMemo(
    () => ({ activity }) => {
      const { from: { role } = {} } = activity;

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
