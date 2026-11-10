import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import activityToNode from './activityToNode.ts';
import { parseDirectLineActivity } from './DirectLineActivity.ts';

scenario(
  'activityToNode()',
  bdd => {
    bdd
      .given('an outgoing activity from the user', () =>
        parseDirectLineActivity(
          {
            channelData: { clientActivityID: 'c-00001' },
            from: { id: 'u-00001', role: 'user' },
            text: 'Hello',
            type: 'message'
          },
          undefined
        )
      )
      .when('converted as "Draft"', activity =>
        activityToNode(activity, {
          conversationId: '_:conversation',
          creativeWorkStatus: 'Draft',
          dateCreated: '1970-01-01T00:00:01.000Z',
          id: '_:m1'
        })
      )
      .then('should have "creativeWorkStatus" of "Draft"', (_, node) => {
        expect(node.creativeWorkStatus).toEqual(['Draft']);
      })
      .and('should only have client activity ID in "identifier"', (_, node) => {
        expect(node.identifier).toEqual(new Set(['_:client-activity:c-00001']));
      })
      .and('should be sent by self', (_, node) => {
        expect(node.sender).toEqual([{ '@id': '_:audience/self' }]);
      })
      .and('should be part of the conversation', (_, node) => {
        expect(node.dateCreated).toBe('1970-01-01T00:00:01.000Z');
        expect(node.isPartOf).toEqual(new Set([{ '@id': '_:conversation' }]));
      });

    bdd
      .given('an incoming activity from the bot', () =>
        parseDirectLineActivity({ from: { id: 'bot', role: 'bot' }, id: 'a-00001', type: 'typing' }, undefined)
      )
      .when('converted as "Published" without "dateCreated"', activity =>
        activityToNode(activity, {
          conversationId: '_:conversation',
          creativeWorkStatus: 'Published',
          dateCreated: undefined,
          id: '_:m1'
        })
      )
      .then('should have "creativeWorkStatus" of "Published"', (_, node) => {
        expect(node.creativeWorkStatus).toEqual(['Published']);
      })
      .and('should be a Message', (_, node) => {
        expect(node['@type']).toEqual(new Set(['Message', 'urn:microsoft:webchat:direct-line-activity']));
      })
      .and('should not have text', (_, node) => {
        expect(node).not.toHaveProperty('text');
      })
      .and('should not be part of the conversation', (_, node) => {
        expect(node).not.toHaveProperty('dateCreated');
        expect(node).not.toHaveProperty('isPartOf');
      });
  },
  NodeTest
);
