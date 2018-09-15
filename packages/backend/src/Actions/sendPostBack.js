const SEND_POST_BACK = 'INPUT/SEND_POST_BACK';

export default function sendPostback(value) {
  return {
    type: SEND_POST_BACK,
    payload: { value }
  };
}

export { SEND_POST_BACK }
