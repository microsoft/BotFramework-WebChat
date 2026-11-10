import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import { parseDirectLineActivity } from './DirectLineActivity.ts';
import getLogicalTimestamp from './getLogicalTimestamp.ts';

scenario(
  'get logical timestamp',
  bdd => {
    bdd
      .given('an activity with timestamp property of new Date(123)', () =>
        parseDirectLineActivity(
          {
            from: { id: 'bot', role: 'bot' },
            id: 'a-00001',
            text: 'Hello, World!',
            timestamp: new Date(123).toISOString(),
            type: 'message'
          },
          undefined
        )
      )
      .when('getting its logical timestamp', activity => getLogicalTimestamp(activity))
      .then('should get 123', (_, actual) => expect(actual).toBe(123));

    bdd
      .given('an activity with sequence ID of 123', () =>
        parseDirectLineActivity(
          {
            channelData: { 'webchat:sequence-id': 123 },
            from: { id: 'bot', role: 'bot' },
            id: 'a-00001',
            text: 'Hello, World!',
            type: 'message'
          },
          undefined
        )
      )
      .when('getting its logical timestamp', activity => getLogicalTimestamp(activity))
      .then('should get 123', (_, actual) => expect(actual).toBe(123));

    bdd
      .given('an activity with both sequence ID of 123 and timestamp of new Date(456)', () =>
        parseDirectLineActivity(
          {
            channelData: { 'webchat:sequence-id': 123 },
            from: { id: 'bot', role: 'bot' },
            id: 'a-00001',
            timestamp: new Date(456).toISOString(),
            type: 'message'
          },
          undefined
        )
      )
      .when('getting its logical timestamp', activity => getLogicalTimestamp(activity))
      .then('should prefer sequence ID', (_, actual) => expect(actual).toBe(123));

    bdd
      .given('an activity with invalid timestamp', () =>
        parseDirectLineActivity(
          { from: { id: 'bot', role: 'bot' }, id: 'a-00001', timestamp: 'invalid', type: 'message' },
          undefined
        )
      )
      .when('getting its logical timestamp', activity => getLogicalTimestamp(activity))
      .then('should get undefined', (_, actual) => expect(actual).toBeUndefined());
  },
  NodeTest
);
