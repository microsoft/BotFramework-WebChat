import type { WebChatActivity } from 'botframework-webchat-core';

import useGetSendTimeoutForActivity from './useGetSendTimeoutForActivity';

let showDeprecationNotes = true;

/** @deprecated Please use "useGetSendTimeoutForActivity()" instead. */
export default function useSendTimeoutForActivity(activity: WebChatActivity) {
  if (showDeprecationNotes) {
    console.warn(
      'botframework-webchat: "useSendTimeoutForActivity" is deprecated and will be removed on or after 2022-07-28. Please use "useGetSendTimeoutForActivity()" instead.'
    );

    showDeprecationNotes = false;
  }

  const getSendTimeoutForActivity = useGetSendTimeoutForActivity();

  return getSendTimeoutForActivity({ activity });
}
