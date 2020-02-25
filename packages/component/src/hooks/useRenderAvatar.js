import { useMemo } from 'react';

import useStyleOptions from './useStyleOptions';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useRenderAvatar({ activity }) {
  const [styleOptions] = useStyleOptions();
  const { avatarRenderer } = useWebChatUIContext();

  return useMemo(() => {
    const { from: { role } = {} } = activity;

    const fromUser = role === 'user';

    const result = avatarRenderer({ activity, fromUser, styleOptions });

    if (result !== false && typeof result !== 'function') {
      console.warn(
        'botframework-webchat: avatarMiddleware should return a function to render the avatar, or return false if avatar should be hidden.'
      );

      return () => result;
    }

    return result;
  }, [activity, avatarRenderer, styleOptions]);
}
