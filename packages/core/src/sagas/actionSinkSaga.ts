import { type Action } from 'redux';
import { take, takeEvery } from 'redux-saga/effects';
import { parse } from 'valibot';

import { REGISTER_ACTION_SINK, type RegisterActionSinkAction } from '../actions/registerActionSink';
import { UNREGISTER_ACTION_SINK, unregisterActionSinkActionSchema } from '../actions/unregisterActionSink';

export default function* actionSinkSaga() {
  yield takeEvery(
    ({ type }) => type === REGISTER_ACTION_SINK,
    function* ({ payload: { sink } }: RegisterActionSinkAction) {
      for (;;) {
        const action: Action = yield take();

        if (
          action.type === UNREGISTER_ACTION_SINK &&
          parse(unregisterActionSinkActionSchema, action).payload.sink === sink
        ) {
          break;
        }

        sink(action);
      }
    }
  );
}
