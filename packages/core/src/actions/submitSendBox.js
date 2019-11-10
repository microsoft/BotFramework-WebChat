const SUBMIT_SEND_BOX = 'WEB_CHAT/SUBMIT_SEND_BOX';

export default function submitSendBox(method = 'keyboard', { channelData } = {}) {
  return {
    type: SUBMIT_SEND_BOX,
    payload: { channelData, method }
  };
}

export { SUBMIT_SEND_BOX };
