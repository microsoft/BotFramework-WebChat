import { useSendBoxHooks } from 'botframework-webchat-redux-store';
import { type Dispatch, type SetStateAction } from 'react';

/**
 * @deprecated Use `useSendBoxHooks().useSendBoxValue()` instead. This hook will be removed on or after 2027-05-30.
 */
export default function useSendBoxValue(): readonly [string, Dispatch<SetStateAction<string>>] {
  // Provides a path for backward compatibility during deprecation.
  // eslint-disable-next-line local-rules/forbid-use-hook-producer
  return useSendBoxHooks().useSendBoxValue();
}
