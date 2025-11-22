/* eslint-disable no-restricted-globals */

import { scenario } from '@testduet/given-when-then';
import type { WebChatActivity } from '../../../../types/WebChatActivity';
import type { LocalId } from '../property/LocalId';
import getLogicalTimestamp from './getLogicalTimestamp';

scenario('get logical timestamp', bdd => {
  bdd
    .given(
      'an activity with timestamp property of new Date(123)',
      () =>
        ({
          channelData: {
            'webchat:internal:local-id': '_:a-00001' as LocalId,
            'webchat:internal:position': 1,
            'webchat:send-status': undefined
          },
          from: { id: 'bot', role: 'bot' },
          id: 'a-00001',
          text: 'Hello, World!',
          timestamp: new Date(123).toISOString(),
          type: 'message'
        }) satisfies WebChatActivity
    )
    .when('getting its logical timestamp', activity => getLogicalTimestamp(activity, { Date }))
    .then('should get 123', (_, actual) => expect(actual).toBe(123));

  bdd
    .given(
      'an activity with sequence ID of 123',
      () =>
        ({
          channelData: {
            'webchat:internal:local-id': '_:a-00001' as LocalId,
            'webchat:internal:position': 1,
            'webchat:sequence-id': 123,
            'webchat:send-status': 'sent'
          },
          from: { id: 'bot', role: 'bot' },
          id: 'a-00001',
          text: 'Hello, World!',
          timestamp: undefined as any,
          type: 'message'
        }) satisfies WebChatActivity
    )
    .when('getting its logical timestamp', activity => getLogicalTimestamp(activity, { Date }))
    .then('should get 123', (_, actual) => expect(actual).toBe(123));
});
