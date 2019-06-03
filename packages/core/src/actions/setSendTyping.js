// TODO: [P3] Take this deprecation code out when releasing on or after 2020 January 13
const SET_SEND_TYPING = 'WEB_CHAT/SET_SEND_TYPING';

export default function setSendTyping(value) {
  // Deprecation notes added to reducer
  return {
    type: SET_SEND_TYPING,
    payload: { sendTyping: !!value }
  };
}

export { SET_SEND_TYPING };
