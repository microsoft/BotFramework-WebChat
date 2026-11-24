import { CONNECT_FULFILLED, CONNECT_PENDING, CONNECT_REJECTED, CONNECT_STILL_PENDING } from '../../actions/connect';
import { RECONNECT_FULFILLED, RECONNECT_PENDING, RECONNECT_REJECTED } from '../../actions/reconnect';
import { is } from '../private/effects';
import type { Machine } from '../types';

const SLOW_CONNECTION_AFTER = 15000;

/**
 * `detectSlowConnectionSaga`: `CONNECT_STILL_PENDING` if a connection or reconnection is not fulfilled or rejected
 * within 15 seconds. The timer is cleared when it completes (the saga left it running).
 */
const detectSlowConnectionMachine: Machine = scope => {
  const loop = () =>
    scope.take(is(CONNECT_PENDING, RECONNECT_PENDING), () => {
      // eslint-disable-next-line prefer-const
      let stopRace: () => void;

      const stopTakingFulfilled = scope.take(is(CONNECT_FULFILLED, RECONNECT_FULFILLED), () => {
        stopRace();
        loop();
      });

      const stopTakingRejected = scope.take(is(CONNECT_REJECTED, RECONNECT_REJECTED), () => {
        stopRace();
        loop();
      });

      const stopSleeping = scope.sleep(SLOW_CONNECTION_AFTER, () => {
        stopRace();
        scope.put({ type: CONNECT_STILL_PENDING }, loop);
      });

      stopRace = () => {
        stopTakingFulfilled();
        stopTakingRejected();
        stopSleeping();
      };
    });

  loop();
};

export default detectSlowConnectionMachine;
