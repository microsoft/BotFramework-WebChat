/* eslint-disable no-restricted-globals */

import { scenario } from '@testduet/given-when-then';
import type { WebChatActivity } from '../../../../types/WebChatActivity';
import type { LocalId } from '../property/LocalId';
import getPartGroupingMetadataMap, { type PartGroupingMetadataMapEntry } from './getPartGroupingMetadataMap';

scenario('getPartGroupingMetadataMap', bdd => {
  bdd
    .given(
      'an activity with isPartOf[@type="HowTo"]',
      () =>
        ({
          channelData: {
            'webchat:internal:local-id': '_:a-00001' as LocalId,
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
        new Map<string, PartGroupingMetadataMapEntry>([
          ['HowTo', { groupingId: '_:c-00001', position: 1 }]
        ]) satisfies ReturnType<typeof getPartGroupingMetadataMap>
      );
    });
});

// TODO: [P0] Enable multiple part grouping once the schema behind `parseThing()` supports multiple part grouping.
scenario('getPartGroupingMetadataMap with multiple part grouping', bdd => {
  bdd
    .given(
      'an activity with isPartOf[@type="Conversation"][@type="HowTo"]',
      () =>
        ({
          channelData: {
            'webchat:internal:local-id': '_:a-00001' as LocalId,
            'webchat:internal:position': 0
          },
          entities: [
            {
              '@context': 'https://schema.org',
              '@id': '',
              '@type': 'Message',
              type: 'https://schema.org/Message',
              isPartOf: [
                { '@id': '_:conv:00001', '@type': 'Conversation' },
                { '@id': '_:how-to:00001', '@type': 'HowTo' }
              ],
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
        new Map<string, PartGroupingMetadataMapEntry>([
          ['Conversation', { groupingId: '_:conv:00001', position: 1 }]
          // TODO: [P0] Currently, it only return the first part grouping.
          // ['HowTo', { groupingId: '_:how-to:00001', position: 1 }]
        ]) satisfies ReturnType<typeof getPartGroupingMetadataMap>
      );
    });
});
