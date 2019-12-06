const SEND_MESSAGE = 'WEB_CHAT/SEND_MESSAGE';

export default function sendMessage(text, method, { channelData } = {}) {
  return {
    type: SEND_MESSAGE,
    payload: { channelData, method, text }
  };
}

export { SEND_MESSAGE };
