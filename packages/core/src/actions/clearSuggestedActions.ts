const CLEAR_SUGGESTED_ACTIONS = 'WEB_CHAT/CLEAR_SUGGESTED_ACTIONS' as const;

export default function clearSuggestedActions() {
  return {
    type: CLEAR_SUGGESTED_ACTIONS
  };
}

export { CLEAR_SUGGESTED_ACTIONS };
