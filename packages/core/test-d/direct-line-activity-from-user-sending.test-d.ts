import { expectAssignable } from 'tsd';

import type { LocalId } from '../src/activity';
import { type WebChatActivity } from '../src/index';

// All activities that are sending, are activities that did not reach the server yet (a.k.a. activity-in-transit).
expectAssignable<WebChatActivity>({
  channelData: {
    'webchat:internal:local-id': 'a-00001' as LocalId,
    'webchat:internal:position': 0,
    'webchat:send-status': 'sending',
    'webchat:sequence-id': 0
  },
  from: {
    id: 'u00001',
    role: 'user'
  },
  localTimestamp: '2000-01-23T12:34:56.000Z', // Activity-in-transit must have local timestamp.
  text: 'Hello, World!',
  type: 'message'
});
