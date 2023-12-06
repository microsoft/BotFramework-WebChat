import type { WebChatActivity } from '../../../../lib/index';

// All activities from bot must be from server.
const activity: WebChatActivity = {
  channelData: {
    'webchat:sequence-id': 0
  },
  from: {
    id: 'u00001',
    role: 'bot'
  },
  id: 'a00001', // All activities from server must have an id.
  text: 'Hello, World!',
  timestamp: '2000-01-23T12:34:56.000Z', // All activities from server must have a server timestamp.
  type: 'message'
};
