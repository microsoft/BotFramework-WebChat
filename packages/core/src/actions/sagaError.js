const SAGA_ERROR = 'WEB_CHAT/SAGA_ERROR';

export default function sagaError() {
  return {
    type: SAGA_ERROR
  };
}

export { SAGA_ERROR };
