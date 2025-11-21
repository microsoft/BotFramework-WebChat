/* eslint-disable no-restricted-globals */

import { scenario } from '@testduet/given-when-then';
import type { WebChatActivity } from '../../../../types/WebChatActivity';
import getPartGroupingMetadataMap from './getPartGroupingMetadataMap';

scenario('getPartGroupingMetadataMap', bdd => {
  bdd
    .given(
      'an activity with isPartOf[@type="HowTo"]',
      () =>
        ({
          channelData: {
            'webchat:internal:id': 'a-00001',
            'webchat:internal:position': 0
          },
          entities: [
            {
              '@context': 'https://schema.org',
              '@id': '',
              '@type': 'Message',
              type: 'https://schema.org/Message',
              isPartOf: { '@id': '_:c-00001', '@type': 'HowTo' },
              position: 1
            } as any // TODO: [P0] We need to redo the typing of `WebChatActivity`.
          ],
          from: {
            id: 'bot',
            role: 'bot'
          },
          id: 'a-00001',
          text: 'Hello, World!',
          timestamp: new Date(0).toISOString(),
          type: 'message'
        }) satisfies WebChatActivity
    )
    .when('getPartGroupingMetadataMap() is called', activity => getPartGroupingMetadataMap(activity))
    .then('should return part grouping metadata', (_, actual) => {
      expect(actual).toEqual(
        new Map([['HowTo', { groupingId: '_:c-00001', position: 1 }]]) satisfies ReturnType<
          typeof getPartGroupingMetadataMap
        >
      );
    });

  // TODO: [P0] Add multiple part grouping. Currently, the schema behind `parseThing()` only supports a single part grouping.
});
