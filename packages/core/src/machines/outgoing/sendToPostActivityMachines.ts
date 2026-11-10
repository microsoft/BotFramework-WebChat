import { EMIT_TYPING_INDICATOR } from '../../actions/emitTypingIndicator';
import postActivity from '../../actions/postActivity';
import { SEND_EVENT } from '../../actions/sendEvent';
import { SEND_FILES } from '../../actions/sendFiles';
import { SEND_MESSAGE } from '../../actions/sendMessage';
import { SEND_MESSAGE_BACK } from '../../actions/sendMessageBack';
import { SEND_POST_BACK } from '../../actions/sendPostBack';
import {
  eventToActivity,
  filesToActivity,
  hasEventToSend,
  hasFilesToSend,
  hasMessageToSend,
  messageBackToActivity,
  messageToActivity,
  postBackToActivity
} from '../../services/private/sendPayloadToActivity';
import type { Machine, MachineAction } from '../types';

/** While online, puts `POST_ACTIVITY` for each action that matches, as the `send*ToPostActivitySaga` did. */
function sendToPostActivity(
  match: (action: MachineAction) => unknown,
  toPostActivity: (action: MachineAction) => MachineAction
): Machine {
  return scope =>
    scope.whileOnline((_, online) => online.on(match, (action, worker) => worker.put(toPostActivity(action))));
}

/** `emitTypingIndicatorToPostActivitySaga`. */
export const emitTypingIndicatorMachine = sendToPostActivity(
  ({ type }) => type === EMIT_TYPING_INDICATOR,
  () => postActivity({ type: 'typing' } as any)
);

/** `sendEventToPostActivitySaga`. */
export const sendEventMachine = sendToPostActivity(
  ({ payload, type }) => type === SEND_EVENT && hasEventToSend(payload),
  ({ payload }) => postActivity(eventToActivity(payload))
);

/** `sendFilesToPostActivitySaga`. */
export const sendFilesMachine = sendToPostActivity(
  ({ payload, type }) => type === SEND_FILES && hasFilesToSend(payload),
  ({ payload }) => postActivity(filesToActivity(payload))
);

/** `sendMessageBackToPostActivitySaga`. */
export const sendMessageBackMachine = sendToPostActivity(
  ({ type }) => type === SEND_MESSAGE_BACK,
  ({ payload }) => postActivity(messageBackToActivity(payload))
);

/** `sendMessageToPostActivitySaga`: the only one that posts with the method of the action. */
export const sendMessageMachine = sendToPostActivity(
  ({ payload, type }) => type === SEND_MESSAGE && hasMessageToSend(payload),
  ({ payload }) => postActivity(messageToActivity(payload), payload.method)
);

/** `sendPostBackToPostActivitySaga`. */
export const sendPostBackMachine = sendToPostActivity(
  ({ type }) => type === SEND_POST_BACK,
  ({ payload }) => postActivity(postBackToActivity(payload))
);
