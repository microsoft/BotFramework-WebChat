const SEND_POST_BACK = 'WEB_CHAT/SEND_POST_BACK';

export default function sendPostback(value, replyToId = undefined) {
  return {
    type: SEND_POST_BACK,
    payload: { value, replyToId }
  };
}

export { SEND_POST_BACK };
