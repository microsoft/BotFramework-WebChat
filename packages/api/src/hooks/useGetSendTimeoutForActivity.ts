import { useMemo } from 'react';

import DirectLineActivity from '../types/external/DirectLineActivity';
import useStyleOptions from './useStyleOptions';

export default function useGetSendTimeoutForActivity(): ({ activity }: { activity: DirectLineActivity }) => number {
  const [{ sendTimeout, sendTimeoutForAttachments }] = useStyleOptions();

  return useMemo(
    () => ({ activity }) => {
      if (typeof sendTimeout === 'function') {
        return sendTimeout(activity);
      }

      return activity.attachments && activity.attachments.length ? sendTimeoutForAttachments : sendTimeout;
    },
    [sendTimeout, sendTimeoutForAttachments]
  );
}
