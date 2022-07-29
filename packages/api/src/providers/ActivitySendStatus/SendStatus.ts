/**
 * - `"sending"`, the activity is currently in transit;
 * - `"sent"`, the activity is sent and acknowledged by the platform;
 * - `"send failed"`, the activity failed to send.
 */
type SendStatus = 'sending' | 'send failed' | 'sent';

export type { SendStatus };
