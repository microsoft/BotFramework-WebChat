import { type SendBoxAttachment } from 'botframework-webchat-core';
import { useSendBoxHooks } from 'botframework-webchat-redux-store';
import { type Dispatch, type SetStateAction } from 'react';

/**
 * @deprecated Use `useSendBoxHooks().useSendBoxAttachments()` instead. This hook will be removed on or after 2027-05-30.
 */
export default function useSendBoxAttachments(): readonly [
  readonly SendBoxAttachment[],
  Dispatch<SetStateAction<readonly SendBoxAttachment[]>>
] {
  // Provides a path for backward compatibility during deprecation.
  // eslint-disable-next-line local-rules/forbid-use-hook-producer
  return useSendBoxHooks().useSendBoxAttachments();
}
