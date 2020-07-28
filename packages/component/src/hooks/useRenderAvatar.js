import { useMemo } from 'react';

import useStyleOptions from './useStyleOptions';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useRenderAvatar({ activity: activityFromHook } = {}) {
  // TODO: Bridge to old version and add tests for both new/old signature.

  if (activityFromHook) {
    console.warn(
      'botframework-webchat: Passing activity directly to useRenderAvatar() has been deprecated. Please refer to HOOKS.md for details. This function signature will be removed on or after 2020-07-27.'
    );
  }

  const [styleOptions] = useStyleOptions();
  const { avatarRenderer } = useWebChatUIContext();

  return useMemo(
    () => ({ activity = activityFromHook } = {}) => {
      const { from: { role } = {} } = activity;

      const result = avatarRenderer({
        activity,
        fromUser: role === 'user',
        styleOptions
      });

      if (result !== false && typeof result !== 'function') {
        console.warn(
          'botframework-webchat: avatarMiddleware should return a function to render the avatar, or return false if avatar should be hidden.'
        );

        return () => result;
      }

      return result;
    },
    [avatarRenderer, styleOptions]
  );
}
