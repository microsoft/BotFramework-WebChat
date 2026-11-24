import actionSinkMachine from './actionSinkMachine';
import connectionStatusToNotificationMachine from './connection/connectionStatusToNotificationMachine';
import connectionStatusUpdateMachine from './connection/connectionStatusUpdateMachine';
import connectMachine from './connection/connectMachine';
import detectSlowConnectionMachine from './connection/detectSlowConnectionMachine';
import observeActivityMachine from './incoming/observeActivityMachine';
import queueIncomingActivityMachine from './incoming/queueIncomingActivityMachine';
import clearSuggestedActionsOnPostActivityMachine from './outgoing/clearSuggestedActionsOnPostActivityMachine';
import postActivityMachine from './outgoing/postActivityMachine';
import postVoiceActivityMachine from './outgoing/postVoiceActivityMachine';
import {
  emitTypingIndicatorMachine,
  sendEventMachine,
  sendFilesMachine,
  sendMessageBackMachine,
  sendMessageMachine,
  sendPostBackMachine
} from './outgoing/sendToPostActivityMachines';
import createChannel, { isPut } from './private/createChannel';
import createScope from './private/createScope';
import { asap, immediately } from './private/scheduler';
import sendTypingIndicatorOnSetSendBoxMachine from './sendBox/sendTypingIndicatorOnSetSendBoxMachine';
import submitSendBoxMachine from './sendBox/submitSendBoxMachine';
import {
  markAllAsSpokenOnStopSpeakActivityMachine,
  speakActivityAndStartDictateOnIncomingActivityFromOthersMachine,
  startDictateOnSpeakCompleteMachine,
  startSpeakActivityOnPostActivityMachine,
  stopDictateOnCardActionMachine,
  stopSpeakingActivityOnInputMachine
} from './speech/speechMachines';
import type { Machine, MachineAction, MachineHost } from './types';

type Machines = {
  /** After the reducers reduced an action: a put one goes to the takers now, any other after the current task. */
  readonly afterReduce: (action: MachineAction) => void;
  /** Starts every machine, in order. */
  readonly start: () => void;
  /** Stops every machine, in order. */
  readonly stop: () => void;
};

// In the order redux-saga forked the sagas they replaced: machines waiting for the same action are called in this order.
const MACHINES: readonly Machine[] = Object.freeze([
  actionSinkMachine,
  clearSuggestedActionsOnPostActivityMachine,
  connectionStatusToNotificationMachine,
  connectionStatusUpdateMachine,
  connectMachine,
  detectSlowConnectionMachine,
  emitTypingIndicatorMachine,
  markAllAsSpokenOnStopSpeakActivityMachine,
  observeActivityMachine,
  postActivityMachine,
  postVoiceActivityMachine,
  queueIncomingActivityMachine,
  sendEventMachine,
  sendFilesMachine,
  sendMessageBackMachine,
  sendMessageMachine,
  sendPostBackMachine,
  sendTypingIndicatorOnSetSendBoxMachine,
  speakActivityAndStartDictateOnIncomingActivityFromOthersMachine,
  startDictateOnSpeakCompleteMachine,
  startSpeakActivityOnPostActivityMachine,
  stopDictateOnCardActionMachine,
  stopSpeakingActivityOnInputMachine,
  submitSendBoxMachine
]);

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
