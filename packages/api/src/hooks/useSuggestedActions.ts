import { useSuggestedActionsHooks } from '@msinternal/botframework-webchat-redux-store';

/**
 * @deprecated Use `useSuggestedActionsHooks().useSuggestedActions` instead. This hook will be removed on or after 2027-05-30.
 */
export default function useSuggestedActions() {
  // Provides a path for backward compatibility during deprecation.
  // eslint-disable-next-line local-rules/forbid-use-hook-producer
  return useSuggestedActionsHooks().useSuggestedActions();
}
