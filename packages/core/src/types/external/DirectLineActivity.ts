// TODO: [P1] #3953 We should fully type it out.

// Until we fully typed out DirectLineActivity, we need to use "any" here.
// We only know the DirectLineActivity must be a map, and not other primitive types.

import type { AnyAnd } from '../AnyAnd';
import DirectLineSuggestedAction from './DirectLineSuggestedAction';

type KnownAttachment = AnyAnd<{
  contentType?: string;
  contentUrl?: string;
  name?: string;
  thumbnailUrl?: string;
}>;

type KnownChannelData = AnyAnd<{
  clientActivityID?: string;
  clientTimestamp?: string;
  messageBack?: {
    displayText?: string;
  };
  state?: string;
  'webchat:fallback-text'?: string;
}>;

type KnownConversation = AnyAnd<{
  id?: string;
}>;

type ClientCapabilitiesEntity = {
  requiresBotState?: boolean;
  supportsListening?: boolean;
  supportsTts?: boolean;
  type: 'ClientCapabilities';
};

type KnownEntity = ClientCapabilitiesEntity;

type KnownUser = AnyAnd<{
  id?: string;
  name?: string;
  role?: 'bot' | 'channel' | 'user';
}>;

type BasicActivity = {
  channelData?: KnownChannelData;
  channelId?: 'webchat';
  conversation?: KnownConversation;
  entities?: KnownEntity[];
  from?: KnownUser;
  id?: string;
  locale?: string;
  localTimestamp?: string;
  localTimezone?: string;
  receipient?: KnownUser;
  timestamp?: string;
  type?: string;
};

type MessageActivity = BasicActivity & {
  attachmentLayout?: 'carousel' | 'stacked';
  attachments?: KnownAttachment[];
  inputHint?: 'accepting' | 'expecting' | 'ignoring';
  speak?: string;
  suggestedActions?: DirectLineSuggestedAction;
  text?: string;
  textFormat?: 'markdown' | 'plain' | 'xml';
  type?: 'message';
};

type KnownActivity = AnyAnd<BasicActivity | MessageActivity>;

type DirectLineActivity = KnownActivity;

export default DirectLineActivity;
