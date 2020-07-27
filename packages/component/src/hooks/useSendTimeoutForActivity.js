import { useMemo } from 'react';

import useStyleOptions from './useStyleOptions';

export default function useSendTimeoutForActivity(activity) {
  const [{ sendTimeout, sendTimeoutForAttachments }] = useStyleOptions();

  const getSendTimeout = useMemo(
    () => ({ activity }) => {
      if (typeof sendTimeout === 'function') {
        return sendTimeout(activity);
      }

      return activity.attachments && activity.attachments.length ? sendTimeoutForAttachments : sendTimeout;
    },
    [sendTimeout, sendTimeoutForAttachments]
  );

  // TODO: Add tests
  if (activity) {
    console.warn(
      'botframework-webchat: Passing activity directly to useSendTimeoutForActivity() has been deprecated. Please refer to HOOKS.md for details. This function signature will be removed on or after 2020-07-26.'
    );

    return getSendTimeout(activity);
  }

  return getSendTimeout;
}
