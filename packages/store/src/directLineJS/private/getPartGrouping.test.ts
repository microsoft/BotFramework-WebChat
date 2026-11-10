import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import { parseDirectLineActivity } from './DirectLineActivity.ts';
import getPartGrouping from './getPartGrouping.ts';

function createActivity(isPartOf: unknown) {
  return parseDirectLineActivity(
    {
      entities: [
        {
          '@context': 'https://schema.org',
          '@id': '',
          '@type': 'Message',
          isPartOf,
          position: 1,
          type: 'https://schema.org/Message'
        }
      ],
      from: { id: 'bot', role: 'bot' },
      id: 'a-00001',
      text: 'Hello, World!',
      timestamp: new Date(0).toISOString(),
      type: 'message'
    },
    undefined
  );
}

scenario(
  'getPartGrouping',
  bdd => {
    bdd
      .given('an activity with isPartOf[@type="HowTo"]', () => createActivity({ '@id': '_:c-00001', '@type': 'HowTo' }))
      .when('getPartGrouping() is called', activity => getPartGrouping(activity, 'HowTo'))
      .then('should return part grouping', (_, actual) => {
        expect(actual).toEqual({ groupingId: '_:c-00001', position: 1 });
      });

    bdd
      .given('an activity with isPartOf[@type="Conversation"][@type="HowTo"]', () =>
        createActivity([
          { '@id': '_:conv:00001', '@type': 'Conversation' },
          { '@id': '_:how-to:00001', '@type': 'HowTo' }
        ])
      )
      .when('getPartGrouping() is called', activity => ({
        conversation: getPartGrouping(activity, 'Conversation'),
        howTo: getPartGrouping(activity, 'HowTo')
      }))
      .then('should return part grouping of each type', (_, actual) => {
        expect(actual).toEqual({
          conversation: { groupingId: '_:conv:00001', position: 1 },
          howTo: { groupingId: '_:how-to:00001', position: 1 }
        });
      });

    bdd
      .given('an activity without entities', () =>
        parseDirectLineActivity({ from: { id: 'bot', role: 'bot' }, id: 'a-00001', type: 'message' }, undefined)
      )
      .when('getPartGrouping() is called', activity => getPartGrouping(activity, 'HowTo'))
      .then('should return undefined', (_, actual) => {
        expect(actual).toBeUndefined();
      });
  },
  NodeTest
);
