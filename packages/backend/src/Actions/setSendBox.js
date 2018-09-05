const SET_SEND_BOX = 'INPUT/SET_SEND_BOX';

export default function (text) {
  return {
    type: SET_SEND_BOX,
    payload: { text }
  };
}

export { SET_SEND_BOX }
