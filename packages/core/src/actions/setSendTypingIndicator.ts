const SET_SEND_TYPING_INDICATOR = 'WEB_CHAT/SET_SEND_TYPING_INDICATOR';

type SetSendTypingIndicatorAction = {
  payload: { sendTypingIndicator: boolean };
  type: typeof SET_SEND_TYPING_INDICATOR;
};

export default function setSendTypingIndicator(value): SetSendTypingIndicatorAction {
  return {
    payload: { sendTypingIndicator: !!value },
    type: SET_SEND_TYPING_INDICATOR
  };
}

export { SET_SEND_TYPING_INDICATOR };

export type { SetSendTypingIndicatorAction };
