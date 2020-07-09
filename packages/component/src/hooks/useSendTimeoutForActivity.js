import { useMemo } from 'react';

import useStyleOptions from './useStyleOptions';

export default function useSendTimeoutForActivity() {
  const [{ sendTimeout, sendTimeoutForAttachments }] = useStyleOptions();

  return useMemo(
    () => activity => {
      if (typeof sendTimeout === 'function') {
        return sendTimeout(activity);
      }

      return activity.attachments && activity.attachments.length ? sendTimeoutForAttachments : sendTimeout;
    },
    [sendTimeout, sendTimeoutForAttachments]
  );
}
