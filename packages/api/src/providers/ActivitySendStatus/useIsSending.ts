import { useActivitySendStatusSubContext } from './private/SubContext';

/**
 * Returns `true` if there is at least one outgoing activity currently in the `"sending"` state, otherwise `false`.
 *
 * Note: presentational activities (e.g. event activity or message activity without visible contents) are excluded.
 */
export default function useIsSending(): readonly [boolean] {
  return useActivitySendStatusSubContext().isSendingState;
}
