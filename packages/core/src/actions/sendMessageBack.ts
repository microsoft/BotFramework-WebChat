const SEND_MESSAGE_BACK = 'WEB_CHAT/SEND_MESSAGE_BACK';

export default function sendMessageback(value: any, text: string | undefined, displayText: string | undefined) {
  return {
    type: SEND_MESSAGE_BACK,
    payload: { displayText, text, value }
  };
}

export { SEND_MESSAGE_BACK };
