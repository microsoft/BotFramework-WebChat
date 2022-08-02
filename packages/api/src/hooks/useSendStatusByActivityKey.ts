import useSendStatusByActivityKey from '../providers/ActivitySendStatus/useSendStatusByActivityKey';

// This JSDoc is copied from `/providers/ActivityStatus/useSendStatusByActivityKey`.
/**
 * Returns a key/value map which stores the outgoing activity send status by activity key:
 *
 * - `"sending"`, the activity is currently in transit;
 * - `"sent"`, the activity is sent and acknowledged by the platform;
 * - `"send failed"`, the activity failed to send.
 *
 * If the send status is `"send failed"`, it could be due to (non-exhaustive):
 *
 * - Immediate or almost immediate failures, such as network error;
 * - It took longer than `styleOptions.sendTimeout` or `styleOptions.sendTimeoutForAttachments` to send.
 *
 * The send status of an activity could turn from `"send failed"` back to `"sending"` if (non-exhaustive):
 *
 * - The platform support resend and the activity is being resend;
 * - The `styleOptions.sendTimeout` or `styleOptions.sendTimeoutForAttachments` has increased past the expiry, overthrown the previous decision for timeout.
 *
 * If the activity key does not exists in this map, the activity is not an outgoing activity.
 */
export default useSendStatusByActivityKey;
