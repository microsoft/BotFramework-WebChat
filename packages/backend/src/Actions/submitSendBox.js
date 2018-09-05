const SUBMIT_SEND_BOX = 'INPUT/SUBMIT_SEND_BOX';

export default function submitSendBox(via) {
  return {
    type: SUBMIT_SEND_BOX,
    payload: { via }
  };
}

export { SUBMIT_SEND_BOX }
