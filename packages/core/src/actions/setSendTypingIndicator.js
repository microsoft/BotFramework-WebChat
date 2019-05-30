const SET_SEND_TYPING_INDICATOR = 'WEB_CHAT/SET_SEND_TYPING_INDICATOR';

export default function setSendTypingIndicator(value) {
  return {
    type: SET_SEND_TYPING_INDICATOR,
    payload: { sendTypingIndicator: !!value }
  };
}

export { SET_SEND_TYPING_INDICATOR };
