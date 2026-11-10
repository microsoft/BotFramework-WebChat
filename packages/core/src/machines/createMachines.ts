import createChannel, { isPut } from './private/createChannel';
import createScope from './private/createScope';
import { asap, immediately } from './private/scheduler';
import type { Machine, MachineAction, MachineHost } from './types';

type Machines = {
  /** After the reducers reduced an action: a put one goes to the takers now, any other after the current task. */
  readonly afterReduce: (action: MachineAction) => void;
  /** Starts every machine, in order. */
  readonly start: () => void;
  /** Stops every machine, in order. */
  readonly stop: () => void;
};

// In the order `createSagas()` forked the sagas: machines waiting for the same action are called in this order.
const MACHINES: readonly Machine[] = Object.freeze([]);

/**
 * What the sagas did, without redux-saga: each machine takes the actions, selects the state and puts actions through
 * the host, in the order of redux-saga. An error that no machine catches stops every machine, then goes to
 * `host.onError()`.
 */
export default function createMachines(host: MachineHost, machines: readonly Machine[] = MACHINES): Machines {
  const channel = createChannel();
  const root = createScope({ channel, host }, undefined);

  return Object.freeze({
    afterReduce: (action: MachineAction) => {
      isPut(action) ? channel.put(action) : asap(() => channel.put(action));
    },
    start: () =>
      immediately(() =>
        root.start(scope => {
          for (const machine of machines) {
            scope.fork(machine);
          }
        })
      ),
    stop: () => root.stop()
  });
}

export type { Machines };
