const SEND_POST_BACK = 'WEB_CHAT/SEND_POST_BACK';

export default function sendPostback(value: any) {
  return {
    type: SEND_POST_BACK,
    payload: { value }
  };
}

export { SEND_POST_BACK };
