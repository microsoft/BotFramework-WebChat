import useStyleOptions from './useStyleOptions';

export default function useSendTimeoutForActivity(activity) {
  const [{ sendTimeout, sendTimeoutForAttachments }] = useStyleOptions();

  if (typeof sendTimeout === 'function') {
    return sendTimeout(activity);
  }

  return activity.attachments && activity.attachments.length ? sendTimeoutForAttachments : sendTimeout;
}
