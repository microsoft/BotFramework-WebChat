const SEND_EVENT = 'WEB_CHAT/SEND_EVENT';

export default function sendEvent(name: string, value: any) {
  return {
    type: SEND_EVENT,
    payload: { name, value }
  };
}

export { SEND_EVENT };
