import { type SendBoxAttachment } from 'botframework-webchat-core';
import { useSendBoxAttachmentsHooks } from 'botframework-webchat-redux-store';
import { type Dispatch, type SetStateAction } from 'react';

/**
 * @deprecated Use `useSendBoxAttachmentsHooks().useSendBoxAttachments()` instead. This hook will be removed on or after 2027-05-30.
 */
export default function useSendBoxAttachments(): readonly [
  readonly SendBoxAttachment[],
  Dispatch<SetStateAction<readonly SendBoxAttachment[]>>
] {
  // Provides a path for backward compatibility during deprecation.
  // eslint-disable-next-line local-rules/forbid-use-hook-producer
  return useSendBoxAttachmentsHooks().useSendBoxAttachments();
}
