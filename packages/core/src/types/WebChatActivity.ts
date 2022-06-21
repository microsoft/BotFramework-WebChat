// This is Web Chat view of Direct Line Activity, which is defined at https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md.
// It is not a direct port of Direct Line version of Activity.

// For example:
// - "channelId" is not needed by Web Chat, thus, it is optional
// - "localTimestamp" is a must when sending out activities to the server
//    - However, we do not expect the server to return "localTimestamp" as they may not have capability to store this information
// - "conversationUpdate" activity is never sent to Web Chat, thus, it is not defined

import type { AnyAnd } from './AnyAnd';
import type { DirectLineAttachment } from './external/DirectLineAttachment';
import type { DirectLineSuggestedAction } from './external/DirectLineSuggestedAction';

type ChannelData<SendState extends string | undefined, Type extends string> = AnyAnd<
  {
    // TODO: [P2] #3953 Rename to "webchat:attachment-sizes".
    attachmentSizes?: number[];

    // TODO: [P2] #3953 Rename to "webchat:client-activity-id".
    clientActivityID?: string;

    // Sequence ID must be available when chat adapter send it to Web Chat.
    'webchat:sequence-id': number;
  } & (SendState extends string
    ? {
        // TODO: [P2] #3953 Rename to "webchat:send-state".
        state: SendState;
      }
    : {}) &
    (Type extends 'message'
      ? {
          // TODO: [P2] #3953 Rename to "webchat:message-back".
          messageBack?: {
            displayText: string;
          };

          // TODO: [P2] #3953 Rename to "webchat:post-back".
          postBack?: boolean;

          // TODO: [P2] #3953 Rename to "webchat:speak-state".
          speak?: boolean;

          // TODO: [P2] #3953 Rename to "webchat:speech-synthesis-utterance".
          speechSynthesisUtterance?: SpeechSynthesisUtterance;

          // TODO: [P2] #3953 It seems Direct Line added a new "summary" field to cater this case.
          'webchat:fallback-text'?: string;
        }
      : {})
>;

// Entity - https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#entity

type ClientCapabilitiesEntity = {
  requiresBotState?: boolean;
  supportsListening?: boolean;
  supportsTts?: boolean;
  type: 'ClientCapabilities';
};

type Entity = ClientCapabilitiesEntity | AnyAnd<{ type: Exclude<string, 'ClientCapabilities'> }>;

// Channel account - https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#channel-account
type ChannelAcount<Role = 'bot' | 'channel' | 'user'> = {
  id: string;
  name?: string;
  role: Role;
};

// Abstract - content of different activity types

// https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#event-activity
type EventActivityEssence = {
  name: string;
  type: 'event';
  value?: any;
};

// https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#message-activity
type MessageActivityEssence = {
  attachmentLayout?: 'carousel' | 'stacked';
  attachments?: DirectLineAttachment[];
  inputHint?: 'accepting' | 'expecting' | 'ignoring';
  locale?: string;
  speak?: string;
  suggestedActions?: DirectLineSuggestedAction;
  text: string | undefined;
  textFormat?: 'markdown' | 'plain' | 'xml';
  type: 'message';
  value?: any;
};

// https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#typing-activity
type TypingActivityEssence = {
  type: 'typing';
};

// Abstract - timestamps

type TimestampFromServerEssence = {
  id: string;
  localTimestamp?: string;
  timestamp: string;
};

type TimestampInTransitEssence = {
  id?: string;
  localTimestamp: string;
  timestamp?: string;
};

type TimestampEssence<Role extends string, SendState extends string | undefined> = Role extends 'user'
  ? SendState extends 'sending' | 'send failed'
    ? TimestampInTransitEssence
    : TimestampFromServerEssence
  : TimestampFromServerEssence;

// Abstract - core

type CoreActivityEssence<
  Role extends 'bot' | 'channel' | 'user',
  SendState extends string | undefined,
  Type extends string = 'conversationUpdate' | 'event' | 'invoke' | 'message' | 'typing'
> = {
  channelData: ChannelData<SendState, Type>;
  channelId?: string;
  entities?: Entity[];
  from: ChannelAcount<Role>;
  localTimezone?: string;
  replyToId?: string;
  type: string;
} & TimestampEssence<Role, SendState> &
  (Type extends 'event'
    ? EventActivityEssence
    : Type extends 'message'
    ? MessageActivityEssence
    : Type extends 'typing'
    ? TypingActivityEssence
    : { type: Type });

// Concrete

type SelfActivityInTransit = CoreActivityEssence<'user', 'sending' | 'send failed'>;
type SelfActivityFromServer = CoreActivityEssence<'user', 'sent'>;

type SelfActivity = SelfActivityInTransit | SelfActivityFromServer;

type OthersActivity = CoreActivityEssence<'bot' | 'channel', undefined>;

// Exported

type WebChatActivity = SelfActivity | OthersActivity;

export type { WebChatActivity };
