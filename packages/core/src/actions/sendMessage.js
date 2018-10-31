const SEND_MESSAGE = 'WEB_CHAT/SEND_MESSAGE';

export default function sendMessage(text, via) {
  return {
    type: SEND_MESSAGE,
    payload: { text, via }
  };
}

export { SEND_MESSAGE }
