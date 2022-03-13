import type { DirectLineActivity } from 'botframework-webchat-core';

import useStyleOptions from './useStyleOptions';

export default function useTimeoutForSend(): [number | ((activity: DirectLineActivity) => number)] {
  const [{ sendTimeout }] = useStyleOptions();

  return [sendTimeout];
}
