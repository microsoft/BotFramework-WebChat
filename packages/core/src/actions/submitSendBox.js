const SUBMIT_SEND_BOX = 'WEB_CHAT/SUBMIT_SEND_BOX';

export default function submitSendBox(method = 'keyboard') {
  return {
    type: SUBMIT_SEND_BOX,
    payload: { method }
  };
}

export { SUBMIT_SEND_BOX };
