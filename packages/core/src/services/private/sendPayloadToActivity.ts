// This is for the ternary operator of text and value.
/* eslint no-undefined: "off" */

import mime from 'mime';

import type { SendBoxAttachment } from '../../types/SendBoxAttachment';
import type { WebChatActivity } from '../../types/WebChatActivity';

// The activities to post for the payloads of the send actions (`sendMessage()`, `sendMessageBack()`, `sendPostBack()`,
// `sendEvent()`, `sendFiles()`), and whether there is something to post. Same as the `send*ToPostActivitySaga`.
//
// The payloads are read as the sagas read them, without validation: a raw action dispatched by a host works the same.

type SendMessagePayload = {
  readonly attachments?: readonly SendBoxAttachment[] | undefined;
  readonly channelData?: any;
  readonly method?: string | undefined;
  readonly replyToId?: string | undefined;
  readonly text?: string | undefined;
};

type SendMessageBackPayload = {
  readonly displayText?: string | undefined;
  readonly replyToId?: string | undefined;
  readonly text?: string | undefined;
  readonly value?: any;
};

type SendPostBackPayload = { readonly replyToId?: string | undefined; readonly value: any };

type SendEventPayload = { readonly name: string; readonly value?: any };

type SendFilesPayload = {
  readonly files: ArrayLike<{
    readonly name: string;
    readonly size: number;
    readonly thumbnail?: string;
    readonly url: string;
  }>;
};

const EMPTY_ATTACHMENTS: readonly SendBoxAttachment[] = Object.freeze([]);

const getType = mime.getType.bind(mime);

/** Whether `sendMessage()` posts: with a text or an attachment. */
function hasMessageToSend(payload: SendMessagePayload): boolean {
  return !!(payload.text || payload.attachments?.length);
}

function messageToActivity({
  attachments = EMPTY_ATTACHMENTS,
  channelData,
  replyToId,
  text
}: SendMessagePayload): WebChatActivity {
  return {
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
  } as any; // TODO: Fix WebChatActivity. Currently, it only works with incoming activity, not outgoing.
}

// https://github.com/microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#message-back
function messageBackToActivity({ displayText, replyToId, text, value }: SendMessageBackPayload): WebChatActivity {
  return {
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
  > as WebChatActivity;
}

type PostBackActivity = {
  channelData: { postBack: true };
  replyToId?: string;
  type: 'message';
} & ({ text: string } | { value: any });

// https://github.com/microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#post-back
function postBackToActivity({ replyToId, value }: SendPostBackPayload): WebChatActivity {
  return {
    ...(typeof replyToId === 'undefined' ? {} : { replyToId }),
    channelData: { postBack: true },
    text: typeof value === 'string' ? value : undefined,
    type: 'message',
    value: typeof value !== 'string' ? value : undefined
  } satisfies PostBackActivity as any;
}

/** Whether `sendEvent()` posts: with a name. */
function hasEventToSend(payload: SendEventPayload): boolean {
  return !!payload.name;
}

function eventToActivity({ name, value }: SendEventPayload): WebChatActivity {
  return {
    name,
    type: 'event',
    value
  } as any;
}

/** Whether `sendFiles()` posts: with a file. */
function hasFilesToSend(payload: SendFilesPayload): boolean {
  return !!payload.files.length;
}

function filesToActivity({ files }: SendFilesPayload): WebChatActivity {
  return {
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
  } as any;
}

export {
  eventToActivity,
  filesToActivity,
  hasEventToSend,
  hasFilesToSend,
  hasMessageToSend,
  messageBackToActivity,
  messageToActivity,
  postBackToActivity
};

export type { SendEventPayload, SendFilesPayload, SendMessageBackPayload, SendMessagePayload, SendPostBackPayload };
