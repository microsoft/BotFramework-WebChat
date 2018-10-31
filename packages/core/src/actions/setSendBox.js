const SET_SEND_BOX = 'WEB_CHAT/SET_SEND_BOX';

export default function (text, via) {
  return {
    type: SET_SEND_BOX,
    payload: { text, via }
  };
}

export { SET_SEND_BOX }
