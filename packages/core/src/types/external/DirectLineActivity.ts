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

type KnownActivity = AnyAnd<{
  attachmentLayout?: 'carousel' | 'stacked';
  attachments?: KnownAttachment[];
  channelData?: KnownChannelData;
  channelId?: 'webchat';
  conversation?: KnownConversation;
  entities?: KnownEntity[];
  from?: KnownUser;
  id?: string;
  inputHint?: 'accepting' | 'expecting' | 'ignoring';
  locale?: string;
  localTimestamp?: string;
  localTimezone?: string;
  receipient?: KnownUser;
  speak?: string;
  suggestedActions?: DirectLineSuggestedAction;
  text?: string;
  textFormat?: 'markdown' | 'plain' | 'xml';
  timestamp?: string;
  type?: string;
}>;

type DirectLineActivity = KnownActivity;

export default DirectLineActivity;
