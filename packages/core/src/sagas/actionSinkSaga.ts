import { type Action } from 'redux';
import { take, takeEvery } from 'redux-saga/effects';
import { safeParse } from 'valibot';

import {
  REGISTER_ACTION_SINK,
  registerActionSinkActionSchema,
  type RegisterActionSinkAction
} from '../actions/registerActionSink';
import { UNREGISTER_ACTION_SINK, unregisterActionSinkActionSchema } from '../actions/unregisterActionSink';

export default function* actionSinkSaga() {
  yield takeEvery(
    ({ type }) => type === REGISTER_ACTION_SINK,
    function* (action: RegisterActionSinkAction) {
      const result = safeParse(registerActionSinkActionSchema, action);

      if (result.success) {
        const {
          payload: { sink }
        } = result.output;

        for (;;) {
          const action: Action = yield take();

          if (action.type === UNREGISTER_ACTION_SINK) {
            const result = safeParse(unregisterActionSinkActionSchema, action);

            if (result.success && result.output.payload.sink === sink) {
              break;
            }
          }

          sink(action);
        }
      }
    }
  );
}
