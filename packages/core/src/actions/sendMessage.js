const SEND_MESSAGE = 'WEB_CHAT/SEND_MESSAGE';

export default function sendMessage(text, method, { channelData } = {}, replyToId = undefined) {
  return {
    type: SEND_MESSAGE,
    payload: { channelData, method, text, replyToId }
  };
}

export { SEND_MESSAGE };
