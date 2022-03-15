import type { WebChatActivity } from 'botframework-webchat-core';

import useStyleOptions from './useStyleOptions';

export default function useTimeoutForSend(): [number | ((activity: WebChatActivity) => number)] {
  const [{ sendTimeout }] = useStyleOptions();

  return [sendTimeout];
}
