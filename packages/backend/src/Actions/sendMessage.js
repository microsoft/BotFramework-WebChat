const SEND_MESSAGE = 'INPUT/SEND_MESSAGE';

export default function sendMessage(text, via) {
  return {
    type: SEND_MESSAGE,
    payload: { text, via }
  };
}

export { SEND_MESSAGE }
