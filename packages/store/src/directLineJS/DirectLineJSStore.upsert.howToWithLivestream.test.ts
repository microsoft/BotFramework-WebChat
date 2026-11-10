import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import {
  createTestStore,
  getActivityNode,
  getRawActivity,
  getSortedEntries,
  isPartOfConversation,
  toISOString
} from './private/test/inspectDirectLineJSStore.ts';

// Ported from `upsert.howToWithLivestream.spec.ts` of `botframework-webchat-core`.

type LivestreamActivityInit =
  | {
      readonly channelData: { readonly streamId: string; readonly streamType: 'final' };
      readonly id: string;
      readonly text: string;
      readonly timestamp: string;
      readonly type: 'message';
    }
  | {
      readonly channelData:
        | {
            readonly streamId: string;
            readonly streamSequence: number;
            readonly streamType: 'informative' | 'streaming';
          }
        | { readonly streamSequence: 1; readonly streamType: 'informative' | 'streaming' };
      readonly id: string;
      readonly text: string;
      readonly timestamp: string;
      readonly type: 'typing';
    };

type MessageEntityInit = {
  readonly isPartOf: readonly { readonly '@id': string; readonly '@type': string }[];
  readonly position: number;
};

function buildActivity(activity: LivestreamActivityInit, messageEntity: MessageEntityInit | undefined) {
  return Object.freeze({
    ...(messageEntity
      ? {
          entities: Object.freeze([
            Object.freeze({
              '@context': 'https://schema.org',
              '@id': '',
              '@type': 'Message',
              type: 'https://schema.org/Message',
              ...messageEntity
            })
          ])
        }
      : {}),
    from: Object.freeze({ id: 'bot', role: 'bot' }),
    ...activity
  });
}

scenario(
  'upserting plain activity in the same grouping',
  bdd => {
    const activity1 = buildActivity(
      {
        channelData: { streamSequence: 1, streamType: 'streaming' },
        id: 'a-00001',
        text: 'A quick',
        timestamp: toISOString(1_000),
        type: 'typing'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    const activity2 = buildActivity(
      {
        channelData: { streamId: 'a-00001', streamSequence: 2, streamType: 'streaming' },
        id: 'a-00002',
        text: 'A quick brown fox',
        timestamp: toISOString(2_000),
        type: 'typing'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    const activity3 = buildActivity(
      {
        channelData: { streamId: 'a-00001', streamType: 'final' },
        id: 'a-00003',
        text: 'A quick brown fox jumped over the lazy dogs.',
        timestamp: toISOString(3_000),
        type: 'message'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    bdd
      .given('a Direct Line store', () => createTestStore())
      .when('the first activity is upserted', ({ emitActivity }) => emitActivity(activity1))
      .then('should have the activity in the node', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00001'))).toEqual(activity1);
      })
      .and('should match sorted activities', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([{ activityId: 'a-00001', dateCreated: toISOString(1_000) }]);
      })
      .when('the second activity is upserted', ({ emitActivity }) => emitActivity(activity2))
      .then('should have the activities in the nodes', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00001'))).toEqual(activity1);
        expect(getRawActivity(getActivityNode(store, 'a-00002'))).toEqual(activity2);
      })
      .and('should not update timestamp of the grouping', ({ store }) => {
        // The livestream session keeps the timestamp of the first revision, so do the grouping.
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00001', dateCreated: toISOString(1_000) },
          { activityId: 'a-00002', dateCreated: toISOString(1_001) }
        ]);
      })
      .when('the third activity is upserted', ({ emitActivity }) => emitActivity(activity3))
      .then('should have the activities in the nodes', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00001'))).toEqual(activity1);
        expect(getRawActivity(getActivityNode(store, 'a-00002'))).toEqual(activity2);
        expect(getRawActivity(getActivityNode(store, 'a-00003'))).toEqual(activity3);
      })
      .and('should remove intermediate revisions from the conversation', ({ store }) => {
        expect(isPartOfConversation(store, 'a-00001')).toBe(false);
        expect(isPartOfConversation(store, 'a-00002')).toBe(false);
      })
      .and('should only have the final revision, with timestamp of the grouping updated on finalize', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([{ activityId: 'a-00003', dateCreated: toISOString(3_000) }]);
      });
  },
  NodeTest
);

scenario(
  're-sending the final revision of a livestream in a grouping without `isPartOf`',
  bdd => {
    const activity1 = buildActivity(
      {
        channelData: { streamSequence: 1, streamType: 'streaming' },
        id: 'a-00001',
        text: 'A quick',
        timestamp: toISOString(1_000),
        type: 'typing'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    const activity2 = buildActivity(
      {
        channelData: { streamId: 'a-00001', streamType: 'final' },
        id: 'a-00002',
        text: 'A quick brown fox jumped over the lazy dogs.',
        timestamp: toISOString(2_000),
        type: 'message'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    // Same ID as the final revision, without `isPartOf`.
    const activity2WithoutGrouping = buildActivity(
      {
        channelData: { streamId: 'a-00001', streamType: 'final' },
        id: 'a-00002',
        text: 'A quick brown fox jumped over the lazy dogs.',
        timestamp: toISOString(2_000),
        type: 'message'
      },
      undefined
    );

    bdd
      .given('a finalized livestream session in a part grouping', () => createTestStore([activity1, activity2]))
      .when('the final revision is re-sent without `isPartOf`', ({ emitActivity }) =>
        emitActivity(activity2WithoutGrouping)
      )
      .then('the livestream session should stay finalized', ({ store }) => {
        expect(isPartOfConversation(store, 'a-00001')).toBe(false);
        expect(getActivityNode(store, 'a-00001')).toBeTruthy();
      })
      .and('should ignore the re-sent final revision', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00002'))).toEqual(activity2);
      })
      .and('the final revision should be rendered once', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([{ activityId: 'a-00002', dateCreated: toISOString(2_000) }]);
      });
  },
  NodeTest
);

scenario(
  're-sending an older revision of a finalized livestream in a grouping without `isPartOf`',
  bdd => {
    const activity1 = buildActivity(
      {
        channelData: { streamSequence: 1, streamType: 'streaming' },
        id: 'a-00001',
        text: 'A quick',
        timestamp: toISOString(1_000),
        type: 'typing'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    const activity2 = buildActivity(
      {
        channelData: { streamId: 'a-00001', streamSequence: 2, streamType: 'streaming' },
        id: 'a-00002',
        text: 'A quick brown fox',
        timestamp: toISOString(2_000),
        type: 'typing'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    const activity3 = buildActivity(
      {
        channelData: { streamId: 'a-00001', streamType: 'final' },
        id: 'a-00003',
        text: 'A quick brown fox jumped over the lazy dogs.',
        timestamp: toISOString(3_000),
        type: 'message'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    // Same ID as the second revision, without `isPartOf`.
    const activity2WithoutGrouping = buildActivity(
      {
        channelData: { streamId: 'a-00001', streamSequence: 2, streamType: 'streaming' },
        id: 'a-00002',
        text: 'A quick brown fox',
        timestamp: toISOString(2_000),
        type: 'typing'
      },
      undefined
    );

    bdd
      .given('a finalized livestream session in a part grouping', () =>
        createTestStore([activity1, activity2, activity3])
      )
      .when('the second revision is re-sent without `isPartOf`', ({ emitActivity }) =>
        emitActivity(activity2WithoutGrouping)
      )
      .then('should keep the second revision in the node', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00002'))).toEqual(activity2);
      })
      .and('should keep the livestream session finalized with all revisions', ({ store }) => {
        expect(getActivityNode(store, 'a-00001')).toBeTruthy();
        expect(getActivityNode(store, 'a-00002')).toBeTruthy();
        expect(getActivityNode(store, 'a-00003')).toBeTruthy();
        expect(isPartOfConversation(store, 'a-00001')).toBe(false);
        expect(isPartOfConversation(store, 'a-00002')).toBe(false);
      })
      .and('should only render the final revision', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([{ activityId: 'a-00003', dateCreated: toISOString(3_000) }]);
      });
  },
  NodeTest
);

scenario(
  're-sending a revision of an ongoing livestream in a grouping',
  bdd => {
    const activity1 = buildActivity(
      {
        channelData: { streamSequence: 1, streamType: 'streaming' },
        id: 'a-00001',
        text: 'A quick',
        timestamp: toISOString(1_000),
        type: 'typing'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    const activity2 = buildActivity(
      {
        channelData: { streamId: 'a-00001', streamSequence: 2, streamType: 'streaming' },
        id: 'a-00002',
        text: 'A quick brown fox',
        timestamp: toISOString(2_000),
        type: 'typing'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    // Same ID with a changed text, e.g. delivered again after a reconnect.
    const activity2Changed = buildActivity(
      {
        channelData: { streamId: 'a-00001', streamSequence: 2, streamType: 'streaming' },
        id: 'a-00002',
        text: 'a-00002:CHANGED',
        timestamp: toISOString(2_000),
        type: 'typing'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    bdd
      .given('an ongoing livestream session with 2 revisions in a part grouping', () =>
        createTestStore([activity1, activity2])
      )
      .when('the second revision is re-sent with a changed text', ({ emitActivity }) => emitActivity(activity2Changed))
      .then('should have the changed revision in the node', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00002'))).toEqual(activity2Changed);
        expect(getActivityNode(store, 'a-00002')).toHaveProperty('text', ['a-00002:CHANGED']);
      })
      .and('should keep 2 revisions in the livestream session, with the changed revision once', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00001', dateCreated: toISOString(1_000) },
          { activityId: 'a-00002', dateCreated: toISOString(1_001) }
        ]);
      });
  },
  NodeTest
);

scenario(
  're-sending a middle revision of an ongoing livestream in a grouping',
  bdd => {
    const activity1 = buildActivity(
      {
        channelData: { streamSequence: 1, streamType: 'streaming' },
        id: 'a-00001',
        text: 'A quick',
        timestamp: toISOString(1_000),
        type: 'typing'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    const activity2 = buildActivity(
      {
        channelData: { streamId: 'a-00001', streamSequence: 2, streamType: 'streaming' },
        id: 'a-00002',
        text: 'A quick brown fox',
        timestamp: toISOString(2_000),
        type: 'typing'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    const activity3 = buildActivity(
      {
        channelData: { streamId: 'a-00001', streamSequence: 3, streamType: 'streaming' },
        id: 'a-00003',
        text: 'A quick brown fox jumped',
        timestamp: toISOString(3_000),
        type: 'typing'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    // Same ID as the middle revision with a changed text, e.g. delivered again after a reconnect.
    const activity2Changed = buildActivity(
      {
        channelData: { streamId: 'a-00001', streamSequence: 2, streamType: 'streaming' },
        id: 'a-00002',
        text: 'a-00002:CHANGED',
        timestamp: toISOString(2_000),
        type: 'typing'
      },
      { isPartOf: [{ '@id': '_:how-to:00001', '@type': 'HowTo' }], position: 1 }
    );

    bdd
      .given('an ongoing livestream session with 3 revisions in a part grouping', () =>
        createTestStore([activity1, activity2, activity3])
      )
      .when('the second revision is re-sent with a changed text', ({ emitActivity }) => emitActivity(activity2Changed))
      .then('should have the changed revision in the node', ({ store }) => {
        expect(getRawActivity(getActivityNode(store, 'a-00002'))).toEqual(activity2Changed);
        expect(getActivityNode(store, 'a-00002')).toHaveProperty('text', ['a-00002:CHANGED']);
      })
      .and('should have the changed revision once, before the third revision', ({ store }) => {
        expect(getSortedEntries(store)).toEqual([
          { activityId: 'a-00001', dateCreated: toISOString(1_000) },
          { activityId: 'a-00002', dateCreated: toISOString(1_001) },
          { activityId: 'a-00003', dateCreated: toISOString(1_002) }
        ]);
      });
  },
  NodeTest
);
