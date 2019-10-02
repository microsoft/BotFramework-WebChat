const SEND_EVENT = 'WEB_CHAT/SEND_EVENT';

export default function sendEvent(name, value) {
  return {
    type: SEND_EVENT,
    payload: { name, value }
  };
}

export { SEND_EVENT };
