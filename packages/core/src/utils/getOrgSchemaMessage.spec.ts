import type { WebChatActivity } from '../types/WebChatActivity';
import getOrgSchemaMessage from './getOrgSchemaMessage';

const activityTemplate: WebChatActivity = {
  channelData: { 'webchat:sequence-id': 0 },
  from: { id: 'bot', role: 'bot' },
  id: 'a-00001',
  text: 'Hello, World!',
  timestamp: '2024-03-01T12:34:56.000Z',
  type: 'message'
};

test('should get message', () => {
  const expected = {
    '@context': 'https://schema.org',
    '@id': '',
    '@type': 'Message',
    type: 'https://schema.org/Message'
  };

  expect(getOrgSchemaMessage({ ...activityTemplate, entities: [expected] })).toEqual(expected);
});

test('should not get message without @id of empty string', () => {
  const expected = {
    '@context': 'https://schema.org',
    '@type': 'Message',
    type: 'https://schema.org/Message'
  };

  expect(getOrgSchemaMessage({ ...activityTemplate, entities: [expected] })).toBeUndefined();
});
