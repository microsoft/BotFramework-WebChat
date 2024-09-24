import { expectAssignable } from 'tsd';

import { type WebChatActivity } from '../src/index';

// All activities which are "sent", must be from server.
expectAssignable<WebChatActivity>({
  channelData: {
    'webchat:send-status': 'sent',
    'webchat:sequence-id': 0
  },
  from: {
    id: 'u00001',
    role: 'user'
  },
  id: 'a00001', // Activities from server must have an id.
  text: 'Hello, World!',
  timestamp: '2000-01-23T12:34:56.000Z', // Activities from server must have a server timestamp.
  type: 'message'
});
