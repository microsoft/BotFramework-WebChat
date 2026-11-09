/* eslint no-magic-numbers: ["error", { "ignore": [0, 3000] }] */

import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import type { SendBoxAttachment } from '../types/SendBoxAttachment';
import type { ConnectionService, ConnectionSession } from './createConnectionService';
import type { OutgoingService } from './createOutgoingService';
import createCell from './private/createCell';
import createEmitter from './private/createEmitter';
import type { SendMessagePayload } from './private/sendPayloadToActivity';
import type { Notify, Source } from './types';

// The typing indicator is posted at most every 3 seconds while typing (at 0, 3, 6 s).
const SEND_INTERVAL = 3000;

const EMPTY_ATTACHMENTS: readonly SendBoxAttachment[] = Object.freeze([]);

type ValueListener = (value: string) => void;

type SubmitPayload = { readonly channelData?: unknown; readonly method?: string | undefined };

type SendBoxService = {
  readonly attachments: Source<readonly SendBoxAttachment[]>;
  /** Calls the listener after each `setValue()`, also with the same value (for the speech of later stages). */
  readonly onValue: (listener: ValueListener) => () => void;
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
  active: boolean;
  lastSend: number;
  /** The typing indicator waiting, if any: its timer, then the turn after it fires. */
  pending?: { readonly timer: ReturnType<GlobalScopePonyfill['setTimeout']> } | undefined;
};

/**
 * The send box without Redux: its value, attachments and typing flag, as the reducers of the same names, and what
 * `submitSendBoxSaga` and `sendTypingIndicatorOnSetSendBoxSaga` do.
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
 * - posting an event (or any activity that is not a message) cancels the wait without restarting the 3 seconds.
 *
 * Not kept: the typing timer is cleared when cancelled (the saga left it running, unused).
 */
export default function createSendBoxService({
  connection,
  createSendMessagePayload,
  notify = callListeners => callListeners(),
  outgoing,
  ponyfill
}: {
  readonly connection: Pick<ConnectionService, 'onOnline'>;
  /** The payload of `sendMessage()`, as its action creator builds and validates it. */
  readonly createSendMessagePayload: (
    text: string,
    method: string | undefined,
    init: { readonly attachments: readonly SendBoxAttachment[]; readonly channelData: any }
  ) => SendMessagePayload;
  readonly notify?: Notify | undefined;
  readonly outgoing: Pick<OutgoingService, 'emitTypingIndicator' | 'onPost' | 'sendMessage' | 'whileOnline'>;
  readonly ponyfill: Pick<GlobalScopePonyfill, 'clearTimeout' | 'Date' | 'setTimeout'>;
}): SendBoxService {
  const attachments = createCell(EMPTY_ATTACHMENTS, notify);
  const sendTypingIndicator = createCell(false, notify);
  const value = createCell('', notify);
  const valueEmitter = createEmitter<Parameters<ValueListener>>();
  // While online: the state of the typing indicator.
  let typing: Typing | undefined;

  const cancelTyping = (current: Typing) => {
    current.pending && ponyfill.clearTimeout(current.pending.timer);
    current.pending = undefined;
  };

  const emitTyping = (current: Typing) => {
    current.pending = undefined;
    outgoing.emitTypingIndicator();
    current.lastSend = ponyfill.Date.now();
  };

  connection.onOnline((_: ConnectionSession) => {
    const current: Typing = { active: sendTypingIndicator.get(), lastSend: -Infinity };

    typing = current;

    return () => {
      cancelTyping(current);
      typing === current && (typing = undefined);
    };
  });

  // A post (other than typing) cancels the typing indicator waiting; a message restarts the 3 seconds.
  outgoing.onPost(activity => {
    const current = typing;

    if (current?.active && activity.type !== 'typing') {
      cancelTyping(current);
      activity.type === 'message' && (current.lastSend = -Infinity);
    }
  });

  const setValue = (text: string) => {
    value.set(text);

    const current = typing;

    // As `takeLatest()`: the latest text cancels the typing indicator waiting.
    if (current?.active && text) {
      cancelTyping(current);

      const interval = SEND_INTERVAL - ponyfill.Date.now() + current.lastSend;

      if (interval > 0) {
        // As the saga's `sleep()`: it resumes a turn after the timer fires, so a value set in between cancels it.
        const pending = {
          timer: ponyfill.setTimeout(
            () => Promise.resolve().then(() => current.pending === pending && emitTyping(current)),
            interval
          )
        };

        current.pending = pending;
      } else {
        emitTyping(current);
      }
    }

    valueEmitter.emit(text);
  };

  const setAttachments = (nextAttachments: readonly SendBoxAttachment[]) => attachments.set(nextAttachments);

  return Object.freeze({
    attachments: Object.freeze({ get: attachments.get, subscribe: attachments.subscribe }),
    onValue: valueEmitter.subscribe,
    sendTypingIndicator: Object.freeze({ get: sendTypingIndicator.get, subscribe: sendTypingIndicator.subscribe }),
    setAttachments,
    setSendTypingIndicator: (nextSendTypingIndicator: boolean) => {
      sendTypingIndicator.set(nextSendTypingIndicator);

      const current = typing;

      if (current && current.active !== !!nextSendTypingIndicator) {
        current.active = !!nextSendTypingIndicator;

        // Enabled again: the 3 seconds restart. Disabled: the typing indicator waiting is cancelled.
        current.active ? (current.lastSend = -Infinity) : cancelTyping(current);
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

          // The value is cleared before the message is posted, the attachments after.
          setValue('');
          outgoing.sendMessage(payload);
          setAttachments(Object.freeze([]));
        }
      }),
    value: Object.freeze({ get: value.get, subscribe: value.subscribe })
  });
}

export type { SendBoxService, SubmitPayload, ValueListener };
