// This type is only for this package only and help reducing size of the bundle.
// Externals should use the string literal directly instead.

// TODO: [P3] #4040 When improve treeshaking with named exports, we could export internals from `core` package.
//       import { SENDING, SEND_FAILED, SENT } from 'botframework-webchat-core/internal/SendStatus';

const SENDING = 'sending';
const SEND_FAILED = 'send failed';
const SENT = 'sent';

type SendStatus = typeof SENDING | typeof SEND_FAILED | typeof SENT;

export { SENDING, SEND_FAILED, SENT };
export type { SendStatus };
