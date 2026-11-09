import { type DirectLineCardAction } from 'botframework-webchat-core';

/**
 * The suggested actions after `clearSuggestedActions()`: always this array, so clearing again changes nothing (no
 * re-render). Set by `<ReduxSuggestedActionsMirror>` on `CLEAR_SUGGESTED_ACTIONS`, and passed through as is by
 * `<SuggestedActionsSubscriber>` (the default providers emit it when cleared).
 */
const CLEARED_SUGGESTED_ACTIONS: readonly DirectLineCardAction[] = Object.freeze([]);

export default CLEARED_SUGGESTED_ACTIONS;
