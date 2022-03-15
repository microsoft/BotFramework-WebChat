import { useMemo } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import useStyleOptions from './useStyleOptions';

export default function useGetSendTimeoutForActivity(): ({ activity }: { activity: WebChatActivity }) => number {
  const [{ sendTimeout, sendTimeoutForAttachments }] = useStyleOptions();

  return useMemo(
    () =>
      ({ activity }) => {
        if (typeof sendTimeout === 'function') {
          return sendTimeout(activity);
        }

        return activity.type === 'message' && activity.attachments?.length ? sendTimeoutForAttachments : sendTimeout;
      },
    [sendTimeout, sendTimeoutForAttachments]
  );
}
