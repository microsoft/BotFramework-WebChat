const SEND_MESSAGE = 'WEB_CHAT/SEND_MESSAGE';

export default function sendMessage(text, method) {
  return {
    type: SEND_MESSAGE,
    payload: { method, text }
  };
}

export { SEND_MESSAGE };
