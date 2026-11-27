import type { Middleware } from 'redux';

import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
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
import type { Machine } from './types';

// Machines waiting for the same action are called in this order, so their puts reach the host in this order.
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
 * The machines' middleware, inside every middleware of the host. Each action is reduced first, then goes to the
 * machines: a put one now, any other after the current task. What they put goes through every middleware again. An
 * error that no machine catches stops every machine, then goes to `onError()`.
 */
export default function createMachinesMiddleware({
  machines = MACHINES,
  onError,
  ponyfill
}: {
  /** The machines to run, in order. Web Chat's own if not set. */
  readonly machines?: readonly Machine[] | undefined;
  readonly onError: (error: unknown) => void;
  readonly ponyfill: GlobalScopePonyfill;
}): { readonly middleware: Middleware; readonly start: () => void } {
  let start: (() => void) | undefined;

  return Object.freeze({
    middleware: ({ dispatch, getState }) => {
      const channel = createChannel();
      const root = createScope({ channel, host: { dispatch, getState, onError, ponyfill } }, undefined);

      start = () =>
        immediately(() =>
          root.start(scope => {
            for (const machine of machines) {
              scope.fork(machine);
            }
          })
        );

      return next => (action: any) => {
        const result = next(action);

        isPut(action) ? channel.put(action) : asap(() => channel.put(action));

        return result;
      };
    },
    start: () => start?.()
  });
}
