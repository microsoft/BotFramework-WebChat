const SET_SEND_TIMEOUT = 'WEB_CHAT/SET_SEND_TIMEOUT';

export default function setSendTimeout(sendTimeout: number) {
  return {
    type: SET_SEND_TIMEOUT,
    payload: { sendTimeout }
  };
}

export { SET_SEND_TIMEOUT };
