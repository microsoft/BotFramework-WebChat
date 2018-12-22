const SET_SEND_BOX = 'WEB_CHAT/SET_SEND_BOX';

export default function (text) {
  return {
    type: SET_SEND_BOX,
    payload: { text }
  };
}

export { SET_SEND_BOX }
