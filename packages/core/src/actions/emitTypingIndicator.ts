const EMIT_TYPING_INDICATOR = 'WEB_CHAT/EMIT_TYPING_INDICATOR';

export default function emitTypingIndicator() {
  return {
    type: EMIT_TYPING_INDICATOR
  };
}

export { EMIT_TYPING_INDICATOR };
