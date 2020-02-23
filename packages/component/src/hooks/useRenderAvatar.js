import { useMemo } from 'react';

import useStyleOptions from './useStyleOptions';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useRenderAvatar({ activity }) {
  const [styleOptions] = useStyleOptions();
  const { avatarRenderer } = useWebChatUIContext();
  const { from: { role } = {} } = activity;

  const fromUser = role === 'user';

  return useMemo(() => avatarRenderer({ activity, fromUser, styleOptions }), [activity, fromUser, styleOptions]);
}
