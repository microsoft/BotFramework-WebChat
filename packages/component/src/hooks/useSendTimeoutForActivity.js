import useStyleOptions from './useStyleOptions';

export default function useSendTimeoutForActivity() {
  const [{ sendTimeout, sendTimeoutForAttachments }] = useStyleOptions();

  if (typeof sendTimeout === 'function') {
    return activity => sendTimeout(activity);
  }

  return activity => (activity.attachments && activity.attachments.length ? sendTimeoutForAttachments : sendTimeout);
}
