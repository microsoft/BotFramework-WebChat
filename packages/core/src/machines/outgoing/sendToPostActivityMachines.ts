// This is for the ternary operator of text and value.
/* eslint no-undefined: "off" */

import mime from 'mime';

import { EMIT_TYPING_INDICATOR } from '../../actions/emitTypingIndicator';
import postActivity from '../../actions/postActivity';
import { SEND_EVENT } from '../../actions/sendEvent';
import { SEND_FILES } from '../../actions/sendFiles';
import { SEND_MESSAGE } from '../../actions/sendMessage';
import { SEND_MESSAGE_BACK } from '../../actions/sendMessageBack';
import { SEND_POST_BACK } from '../../actions/sendPostBack';
import type { SendBoxAttachment } from '../../types/SendBoxAttachment';
import type { WebChatActivity } from '../../types/WebChatActivity';
import type { Machine, MachineAction } from '../types';

const EMPTY_ATTACHMENTS: readonly SendBoxAttachment[] = Object.freeze([]);

const getType = mime.getType.bind(mime);

type PostBackActivity = {
  channelData: { postBack: true };
  replyToId?: string;
  type: 'message';
} & ({ text: string } | { value: any });

/**
 * While online, puts `POST_ACTIVITY` for each action that matches. The payloads are read without validation: a raw
 * action dispatched by a host works too.
 */
function sendToPostActivity(
  match: (action: MachineAction) => unknown,
  toPostActivity: (action: MachineAction) => MachineAction
): Machine {
  return scope =>
    scope.whileOnline((_, online) => online.on(match, (action, worker) => worker.put(toPostActivity(action))));
}

export const emitTypingIndicatorMachine = sendToPostActivity(
  ({ type }) => type === EMIT_TYPING_INDICATOR,
  () => postActivity({ type: 'typing' } as any)
);

export const sendEventMachine = sendToPostActivity(
  ({ payload, type }) => type === SEND_EVENT && payload.name,
  ({ payload: { name, value } }) => postActivity({ name, type: 'event', value } as any)
);

export const sendFilesMachine = sendToPostActivity(
  ({ payload, type }) => type === SEND_FILES && payload.files.length,
  ({ payload: { files } }) =>
    postActivity({
      attachments: [].map.call(files, ({ name, thumbnail, url }) => ({
        contentType: getType(name) || 'application/octet-stream',
        contentUrl: url,
        name,
        thumbnailUrl: thumbnail
      })),
      channelData: {
        attachmentSizes: [].map.call(files, ({ size }) => size)
      },
      type: 'message'
    } as any)
);

// https://github.com/microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#message-back
export const sendMessageBackMachine = sendToPostActivity(
  ({ type }) => type === SEND_MESSAGE_BACK,
  ({ payload: { displayText, replyToId, text, value } }) =>
    postActivity({
      channelData: {
        messageBack: {
          displayText
        }
        // TODO: [P2] We need to have a new type `OutgoingWebChatActivity`.
      } satisfies Record<string, unknown> as WebChatActivity['channelData'],
      replyToId,
      text,
      type: 'message',
      value
    } satisfies Omit<
      // TODO: [P2] We need to have a new type `OutgoingWebChatActivity`.
      WebChatActivity & { text: string | undefined; value: string | undefined },
      'from'
    > as WebChatActivity)
);

/** The only one that posts with the method of the action. */
export const sendMessageMachine = sendToPostActivity(
  ({ payload, type }) => type === SEND_MESSAGE && (payload.text || payload.attachments?.length),
  ({ payload: { attachments = EMPTY_ATTACHMENTS, channelData, method, replyToId, text } }) =>
    postActivity(
      {
        attachments: attachments.map(({ blob, thumbnailURL }) => ({
          contentType: (blob instanceof File && blob.type) || 'application/octet-stream',
          // Chat adapter should download the file as binary.
          // In case the chat adapter naively echo back the URL, it will be treated as binary.
          // eslint-disable-next-line no-restricted-properties
          contentUrl: URL.createObjectURL(new Blob([blob], { type: 'application/octet-stream' })),
          name: blob instanceof File ? blob.name : undefined,
          thumbnailUrl: thumbnailURL?.toString()
        })),
        channelData: {
          ...channelData,
          attachmentSizes: attachments.map(({ blob: { size } }) => size)
        },
        replyToId: replyToId || undefined,
        text: text || undefined,
        textFormat: 'plain',
        type: 'message'
      } as any, // TODO: Fix WebChatActivity. Currently, it only works with incoming activity, not outgoing.
      method
    )
);

// https://github.com/microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#post-back
export const sendPostBackMachine = sendToPostActivity(
  ({ type }) => type === SEND_POST_BACK,
  ({ payload: { replyToId, value } }) =>
    postActivity({
      ...(typeof replyToId === 'undefined' ? {} : { replyToId }),
      channelData: { postBack: true },
      text: typeof value === 'string' ? value : undefined,
      type: 'message',
      value: typeof value !== 'string' ? value : undefined
    } satisfies PostBackActivity as any)
);
