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
import type { OrgSchemaThing } from './external/OrgSchemaThing';

type SupportedRole = 'bot' | 'channel' | 'user';
type SupportedSendStatus = 'sending' | 'send failed' | 'sent';

type ChannelData<SendStatus extends SupportedSendStatus | undefined, Type extends string> = AnyAnd<
  {
    // TODO: [P2] #3953 Rename to "webchat:attachment-sizes".
    attachmentSizes?: number[];

    // TODO: [P2] #3953 Rename to "webchat:client-activity-id".
    clientActivityID?: string;

    // Sequence ID must be available when chat adapter send it to Web Chat.
    'webchat:sequence-id': number;
  } & (SendStatus extends SupportedSendStatus
    ? {
        /**
         * @deprecated Since 4.15.3: Please use `channelData['webchat:send-status']` or `useSendStatusByActivityKey()` hook instead.
         *             Please refer to https://github.com/microsoft/BotFramework-WebChat/pull/4362 for details. This field will be removed on or after 2024-07-31.
         */
        state?: SendStatus;

        // The newer "webchat:send-status" is slightly different than the previous "state".
        // The difference is: the newer "webchat:send-status" use a hardcoded 5 minutes timeout, instead of user-defined timeout.
        // We assume web developers will not set a timeout value longer than 5 minutes.
        //
        // The older one use a user-defined timeout, which could be a small number (say, 5s).
        // At t=6s after a message is being sent, the message will be marked as "send failed" and the saga which "wait/listen to delivery status" will stop.
        // Changing `styleOptions.sendTimeout` to 20s will not "revive" the message back to "sending" because the saga has already stopped.
        // Thus, in our old code, we could not make the `state` field useful because it lacks "revivability". Thus, we simply ignored it.
        // As the saga had already stopped, changing `styleOptions.sendTimeout` will not "revive" the message back to "sending."
        // Not able to "revive" the message equally means our React props cannot be changed on-the-fly.
        //
        // The downside of not using `state` field means, if the activity fail immediately or fatally (e.g. network error),
        // the UI will not change to "Send failed" until the specified timeout has passed.
        //
        // With the newer "webchat:send-status" field, the "send failed" state could means:
        // - More than 5 minutes had passed while sending the activity;
        // - Platform returned error (say HTTP 4xx/5xx or network error).
        //
        // UI should use `styleOptions.sendTimeout` with the `activity.localTimestamp` field to determines if the
        // activity is visually timed out or not. And UI should expect `styleOptions` could change at any time.
        //
        // The 5 minutes timeout is currently hardcoded and should be large enough to support user-defined timeouts.
        // As Redux Saga use stack/heap to keep track of waits and this could be expensive, the 5 minutes timeout will GC the waits.
        // The hardcoded timeout value can be easily increased with the cost of memory.
        //
        // In the future:
        //
        // -  If we move to other business logic library that offer lower costs, we could hardcode the timeout to Infinity.
        // -  This flag is set by Web Chat. We should move this flag to somewhere internal and not modifiable/overrideable by chat adapter developers.

        /**
         * The send status of the activity.
         *
         * - `"sending"`, the activity is in-transit and it has not been timed out;
         * - `"send failed"`, the activity cannot be delivered permanently and further processing had been stopped;
         * - `"sent"`, the activity is delivered successfully.
         *
         * Due to network-related race conditions, the activity could be marked as `"send failed"` but delivered by the service.
         * In this case, the activity should continue to mark as `"send failed"`.
         *
         * For further details, please see [#4362](https://github.com/microsoft/BotFramework-WebChat/pull/4362).
         */
        'webchat:send-status': SendStatus;
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

type Entity =
  | ClientCapabilitiesEntity
  | OrgSchemaThing
  | AnyAnd<{ type: Exclude<string, 'ClientCapabilities' | `https://schema.org/${string}`> }>;

// Channel account - https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#channel-account
type ChannelAcount<Role extends SupportedRole> = {
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

type TimestampEssence<
  Role extends SupportedRole,
  SendStatus extends SupportedSendStatus | undefined
> = Role extends 'user'
  ? SendStatus extends 'sending' | 'send failed'
    ? TimestampInTransitEssence
    : TimestampFromServerEssence
  : TimestampFromServerEssence;

// Abstract - core

type CoreActivityEssence<
  Role extends SupportedRole,
  SendStatus extends SupportedSendStatus | undefined,
  Type extends string = 'conversationUpdate' | 'event' | 'invoke' | 'message' | 'typing'
> = {
  channelData: ChannelData<SendStatus, Type>;
  channelId?: string;
  entities?: Entity[];
  from: ChannelAcount<Role>;
  localTimezone?: string;
  replyToId?: string;
  type: string;
} & TimestampEssence<Role, SendStatus> &
  (Type extends 'event'
    ? EventActivityEssence
    : Type extends 'message'
    ? MessageActivityEssence
    : Type extends 'typing'
    ? TypingActivityEssence
    : { type: Type });

// Concrete

type OthersActivity = CoreActivityEssence<'bot' | 'channel', undefined>;

type SelfActivitySendFailed = CoreActivityEssence<'user', 'send failed'>;
type SelfActivitySending = CoreActivityEssence<'user', 'sending'>;
type SelfActivitySent = CoreActivityEssence<'user', 'sent'>;

type SelfActivity = SelfActivitySendFailed | SelfActivitySending | SelfActivitySent;

// Exported

type WebChatActivity = SelfActivity | OthersActivity;

export type { WebChatActivity };
