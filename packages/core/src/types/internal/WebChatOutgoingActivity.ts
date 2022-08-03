// This is a simplified version of DirectLineActivity for outgoing purpose.
// It does not have certain optional or server-assigned fields, such as, "conversationID", "id", "timestamp".

type OutgoingEventActivityEssence = {
  name: string;
  type: 'event';
  value?: any;
};

type OutgoingMessageActivityEssence = {
  attachments?: {}[];
  channelData: {
    attachmentSizes?: number[];
    messageBack?: { displayText: string };
    postBack?: boolean;
  };
  locale?: string;
  text: string | undefined;
  textFormat?: 'markdown' | 'plain' | 'xml';
  type: 'message';
  value?: any;
};

type OutgoingTypingActivityEssence = {
  type: 'typing';
};

type WebChatOutgoingActivity<Type extends string = string> = {
  channelData: {
    clientActivityID: string;
  };
  channelId?: 'webchat';
  entities?: (
    | {
        requiresBotState?: boolean;
        supportsListening?: boolean;
        supportsTts?: boolean;
        type: 'ClientCapabilities';
      }
    | {
        type: Omit<string, 'ClientCapabilities'>;
      }
  )[];
  from: {
    id: string;
    name?: string;
    role: 'user';
  };
  locale: string;
  localTimestamp: string;
  localTimezone?: string;
} & (Type extends 'event'
  ? OutgoingEventActivityEssence
  : Type extends 'message'
  ? OutgoingMessageActivityEssence
  : Type extends 'typing'
  ? OutgoingTypingActivityEssence
  : { type: Type });

export type { WebChatOutgoingActivity };
