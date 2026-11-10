import { safeParse } from 'valibot';

import { REGISTER_ACTION_SINK, registerActionSinkActionSchema } from '../actions/registerActionSink';
import { UNREGISTER_ACTION_SINK, unregisterActionSinkActionSchema } from '../actions/unregisterActionSink';
import type { Machine } from './types';

/**
 * `actionSinkSaga`: each sink registered gets every action after it (as the machines take them), until it is
 * unregistered. The transport of `<ReduxSuggestedActionsMirror>`.
 */
const actionSinkMachine: Machine = scope =>
  scope.on(
    ({ type }) => type === REGISTER_ACTION_SINK,
    (registerAction, worker) => {
      const result = safeParse(registerActionSinkActionSchema, registerAction);

      if (result.success) {
        const {
          payload: { sink }
        } = result.output;

        const loop = () =>
          worker.take(
            () => true,
            action => {
              if (action.type === UNREGISTER_ACTION_SINK) {
                const unregisterResult = safeParse(unregisterActionSinkActionSchema, action);

                if (unregisterResult.success && unregisterResult.output.payload.sink === sink) {
                  return;
                }
              }

              sink(action as any);
              loop();
            }
          );

        loop();
      }
    }
  );

export default actionSinkMachine;
