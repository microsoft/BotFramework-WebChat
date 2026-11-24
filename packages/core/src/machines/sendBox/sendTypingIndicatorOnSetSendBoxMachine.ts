import emitTypingIndicator from '../../actions/emitTypingIndicator';
import { POST_ACTIVITY } from '../../actions/postActivity';
import { SET_SEND_BOX } from '../../actions/setSendBox';
import { SET_SEND_TYPING_INDICATOR } from '../../actions/setSendTypingIndicator';
import sendTypingIndicatorSelector from '../../selectors/sendTypingIndicator';
import type { Machine, Scope } from '../types';

const SEND_INTERVAL = 3000;

function takeSendTypingIndicator(scope: Scope, value: boolean, then: () => void): void {
  scope.take(
    ({ payload, type }) => type === SET_SEND_TYPING_INDICATOR && !payload.sendTypingIndicator === !value,
    then
  );
}

/**
 * `sendTypingIndicatorOnSetSendBoxSaga`: while online and the typing indicator is enabled, each text set in the send
 * box emits the typing indicator, at most every 3 seconds (t = 0, 3000, 6000): one set before then waits, the latest
 * restarting the wait. Posting cancels the wait; posting a message also restarts the 3 seconds.
 *
 * Quirks kept, as the saga: the same text set again emits again; an event posted cancels the wait without restarting
 * the 3 seconds. The timer is cleared when cancelled (the saga left it running).
 */
const sendTypingIndicatorOnSetSendBoxMachine: Machine = scope =>
  scope.whileOnline((_, online) => {
    const { Date } = online.ponyfill;

    const loop = () => {
      let lastSend = -Infinity;

      const task = online.fork(latest =>
        latest.onLatest(
          ({ payload, type }) =>
            (type === SET_SEND_BOX && payload.text) ||
            // Posting anything cancels the pending typing indicator (e.g. typing, then sending at t = 1500, cancels the
            // one at t = 3000).
            (type === POST_ACTIVITY && payload.activity.type !== 'typing'),
          ({ payload, type }, worker) => {
            if (type === SET_SEND_BOX) {
              const interval = SEND_INTERVAL - Date.now() + lastSend;
              const emit = () =>
                worker.put(emitTypingIndicator(), () => {
                  lastSend = Date.now();
                });

              interval > 0 ? worker.sleep(interval, emit) : emit();
            } else if (payload.activity.type === 'message') {
              lastSend = -Infinity;
            }
          }
        )
      );

      takeSendTypingIndicator(online, false, () => {
        task.stop();
        takeSendTypingIndicator(online, true, loop);
      });
    };

    online.select(sendTypingIndicatorSelector) ? loop() : takeSendTypingIndicator(online, true, loop);
  });

export default sendTypingIndicatorOnSetSendBoxMachine;
