const SAGA_ERROR = 'WEB_CHAT/SAGA_ERROR';

type SagaErrorAction = {
  type: typeof SAGA_ERROR;
};

export default function sagaError(): SagaErrorAction {
  return { type: SAGA_ERROR };
}

export { SAGA_ERROR };

export type { SagaErrorAction };
