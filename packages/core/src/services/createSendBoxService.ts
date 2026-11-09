/* eslint no-magic-numbers: ["error", { "ignore": [0, 3000] }] */

import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import type { SendBoxAttachment } from '../types/SendBoxAttachment';
import type { ConnectionService, ConnectionSession } from './createConnectionService';
import type { OutgoingService } from './createOutgoingService';
import createCell from './private/createCell';
import createSagaQueue, { type SagaAction, type SagaQueue } from './private/createSagaQueue';
import throwIfUndefined from './private/throwIfUndefined';
import type { SendMessagePayload } from './private/sendPayloadToActivity';
import type { Notify, Source } from './types';

// The typing indicator is posted at most every 3 seconds while typing (at 0, 3, 6 s).
const SEND_INTERVAL = 3000;

const EMPTY_ATTACHMENTS: readonly SendBoxAttachment[] = Object.freeze([]);

type SubmitPayload = { readonly channelData?: unknown; readonly method?: string | undefined };

type SendBoxService = {
  readonly attachments: Source<readonly SendBoxAttachment[]>;
  readonly sendTypingIndicator: Source<boolean>;
  /** As `SET_SEND_BOX_ATTACHMENTS`. */
  readonly setAttachments: (attachments: readonly SendBoxAttachment[]) => void;
  /** As `SET_SEND_TYPING_INDICATOR`. */
  readonly setSendTypingIndicator: (sendTypingIndicator: boolean) => void;
  /** As `SET_SEND_BOX`: also posts the typing indicator, if enabled. */
  readonly setValue: (value: string) => void;
  /** As `SUBMIT_SEND_BOX`, with its payload: while online, sends the value and the attachments, then clears them. */
  readonly submit: (payload: SubmitPayload) => void;
  readonly value: Source<string>;
};

type Typing = {
  lastSend: number;
  /** The typing indicator waiting, if any: its timer, then the turn after it fires. */
  pending?: { readonly timer: ReturnType<GlobalScopePonyfill['setTimeout']> } | undefined;
  /** While enabled: stops waiting for the values set and the posts. */
  stop?: (() => void) | undefined;
};

/**
 * The send box without Redux: its value, attachments and typing flag, as the reducers of the same names, and what
 * `submitSendBoxSaga` and `sendTypingIndicatorOnSetSendBoxSaga` do, in the order of the sagas (`queue`).
 *
 * While online and with the typing indicator enabled, each value set with a text posts the typing activity, at most
 * every 3 seconds: a value set before then waits, and the latest value set restarts the wait. Posting another activity
 * cancels the wait; posting a message also restarts the 3 seconds.
 *
 * Quirks kept on purpose, as in Redux mode (to fix in both modes later):
 *
 * - submitting while offline does nothing, and keeps the send box;
 * - submitting only spaces clears the send box and sends nothing;
 * - setting the same text again posts the typing indicator again;
 * - posting an event (or any activity that is not a message) cancels the wait without restarting the 3 seconds;
 * - the typing indicator enabled while online waits for the values set after the speech does (as its saga starts
 *   waiting then), until the speech waits again;
 * - a value or attachments set to `undefined` throw to the caller, and nothing changes (the reducers' check).
 *
 * Not kept: the typing timer is cleared when cancelled (the saga left it running, unused).
 */
export default function createSendBoxService({
  connection,
  createSendMessagePayload,
  notify = callListeners => callListeners(),
  outgoing,
  ponyfill,
  queue = createSagaQueue()
}: {
  readonly connection: Pick<ConnectionService, 'onOnline'>;
  /** The payload of `sendMessage()`, as its action creator builds and validates it. */
  readonly createSendMessagePayload: (
    text: string,
    method: string | undefined,
    init: { readonly attachments: readonly SendBoxAttachment[]; readonly channelData: any }
  ) => SendMessagePayload;
  readonly notify?: Notify | undefined;
  readonly outgoing: Pick<OutgoingService, 'emitTypingIndicator' | 'sendMessage' | 'whileOnline'>;
  readonly ponyfill: Pick<GlobalScopePonyfill, 'clearTimeout' | 'Date' | 'setTimeout'>;
  /** The order of the sagas, shared by the services. */
  readonly queue?: SagaQueue | undefined;
}): SendBoxService {
  const attachments = createCell(EMPTY_ATTACHMENTS, notify);
  const sendTypingIndicator = createCell(false, notify);
  const value = createCell('', notify);
  // While online: the state of the typing indicator.
  let typing: Typing | undefined;

  const cancelTyping = (current: Typing) => {
    current.pending && ponyfill.clearTimeout(current.pending.timer);
    current.pending = undefined;
  };

  // Puts `EMIT_TYPING_INDICATOR`; once it ran, the 3 seconds start.
  const emitTyping = (current: Typing) => {
    current.pending = undefined;

    queue.later(() => {
      outgoing.emitTypingIndicator();
      current.lastSend = ponyfill.Date.now();
    });
  };

  const handleTypingAction = (current: Typing, action: SagaAction) => {
    // As `takeLatest()`: the latest action cancels the typing indicator waiting.
    cancelTyping(current);

    if (action.type === 'SET_SEND_BOX') {
      const interval = SEND_INTERVAL - ponyfill.Date.now() + current.lastSend;

      if (interval > 0) {
        // As the saga's `sleep()`: it resumes a turn after the timer fires, so a value set in between cancels it.
        const pending = {
          timer: ponyfill.setTimeout(
            () =>
              Promise.resolve().then(
                () => current.pending === pending && current.stop && queue.batch(() => emitTyping(current))
              ),
            interval
          )
        };

        current.pending = pending;
      } else {
        emitTyping(current);
      }
    } else if (action.type === 'POST_ACTIVITY' && action.activity.type === 'message') {
      current.lastSend = -Infinity;
    }
  };

  // The typing indicator saga waits (again, at the end of the list) for the values set and the posts.
  const startTyping = (current: Typing) => {
    current.lastSend = -Infinity;
    current.stop = queue.onAction(
      action =>
        (action.type === 'SET_SEND_BOX' && !!action.text) ||
        (action.type === 'POST_ACTIVITY' && action.activity.type !== 'typing'),
      action => handleTypingAction(current, action)
    );
  };

  const stopTyping = (current: Typing) => {
    cancelTyping(current);
    current.stop?.();
    current.stop = undefined;
  };

  connection.onOnline((_: ConnectionSession) => {
    const current: Typing = { lastSend: -Infinity };

    typing = current;
    sendTypingIndicator.get() && startTyping(current);

    return () => {
      stopTyping(current);
      typing === current && (typing = undefined);
    };
  });

  // As the reducers: `undefined` throws to the caller, and nothing changes.
  const setValue = (text: string) =>
    queue.batch(() => {
      throwIfUndefined(text, 'WEB_CHAT/SET_SEND_BOX', 'sendBoxValue');
      value.set(text);
      queue.handleAction({ text, type: 'SET_SEND_BOX' });
    });

  const setAttachments = (nextAttachments: readonly SendBoxAttachment[]) => {
    throwIfUndefined(nextAttachments, 'WEB_CHAT/SET_SEND_BOX_ATTACHMENTS', 'sendBoxAttachments');
    attachments.set(nextAttachments);
  };

  return Object.freeze({
    attachments: Object.freeze({ get: attachments.get, subscribe: attachments.subscribe }),
    sendTypingIndicator: Object.freeze({ get: sendTypingIndicator.get, subscribe: sendTypingIndicator.subscribe }),
    setAttachments,
    setSendTypingIndicator: (nextSendTypingIndicator: boolean) => {
      sendTypingIndicator.set(nextSendTypingIndicator);

      const current = typing;

      // Enabled again: the saga waits again (the 3 seconds restart). Disabled: the typing indicator waiting is cancelled.
      if (current && !current.stop !== !nextSendTypingIndicator) {
        nextSendTypingIndicator ? startTyping(current) : stopTyping(current);
      }
    },
    setValue,
    submit: ({ channelData, method }: SubmitPayload) =>
      outgoing.whileOnline(() => {
        const attachmentsToSend = attachments.get();
        const text = value.get();

        // As the saga: an empty text is not sent, but spaces are cleared.
        if (attachmentsToSend.length || text) {
          const payload = createSendMessagePayload(text.trim(), method, {
            attachments: attachmentsToSend,
            channelData
          });

          // Puts the message, then clears the value, then the attachments: each after the previous one ran.
          queue.later(() => {
            outgoing.sendMessage(payload);

            queue.later(() => {
              setValue('');
              queue.later(() => setAttachments(Object.freeze([])));
            });
          });
        }
      }),
    value: Object.freeze({ get: value.get, subscribe: value.subscribe })
  });
}

export type { SendBoxService, SubmitPayload };
