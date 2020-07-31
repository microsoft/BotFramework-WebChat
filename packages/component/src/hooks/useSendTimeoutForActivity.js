import useGetSendTimeoutForActivity from './useGetSendTimeoutForActivity';

let showDeprecationNotes = true;

export default function useSendTimeoutForActivity(activity) {
  if (showDeprecationNotes) {
    console.warn(
      'botframework-webchat: "useSendTimeoutForActivity" is deprecated and will be removed on or after 2022-07-28. Please use "useGetSendTimeoutForActivity()" instead.'
    );

    showDeprecationNotes = false;
  }

  const getSendTimeoutForActivity = useGetSendTimeoutForActivity();

  return getSendTimeoutForActivity({ activity });
}
