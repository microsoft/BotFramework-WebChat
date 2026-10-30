/* eslint-disable no-restricted-globals */
// The reducer on the activities graph (William's store): replaying older states, failed transactions, and the send
// status read from the message node. Repros of Review 2 (`~/webchat-tools/scratch/new-store/review2/`), as tests.
import { scenario } from '@testduet/given-when-then';
import createGroupedActivitiesReducer from './createGroupedActivitiesReducer';

const ponyfill: any = { Date, clearTimeout, setTimeout };
const debugAPI: any = { UNSAFE_callBreakpoint: { incomingActivity: () => undefined } };

function botActivity(id: string, text: string, timestamp: number, extra: Record<string, unknown> = {}) {
  return {
    channelData: {},
    from: { id: 'bot', role: 'bot' },
    id,
    text,
    timestamp: new Date(timestamp).toISOString(),
    type: 'message',
    ...extra
  };
}

function howTo(groupingId: string) {
  return {
    entities: [
      {
        '@context': 'https://schema.org',
        '@id': '',
        '@type': 'Message',
        isPartOf: { '@id': groupingId, '@type': 'HowTo' },
        position: 1,
        type: 'https://schema.org/Message'
      }
    ]
  };
}

const incoming = (activity: unknown) => ({ payload: { activity }, type: 'DIRECT_LINE/INCOMING_ACTIVITY' }) as any;
const ids = (state: any) => state.sortedActivities.map(({ id }: any) => id);
const texts = (state: any) => state.sortedActivities.map(({ text }: any) => text);

scenario('reducing an older state again (replay, time travel)', bdd => {
  bdd
    .given('a reducer with states s0 (empty), s1 (a-1) and s2 (a-1, a-2)', () => {
      const reducer = createGroupedActivitiesReducer(ponyfill, debugAPI);
      const s0 = reducer(undefined, { type: '@@INIT' } as any);
      const s1 = reducer(s0, incoming(botActivity('a-1', 'one', 1_000)));
      const s2 = reducer(s1, incoming(botActivity('a-2', 'two', 2_000)));

      return { reducer, s0, s1, s2 };
    })
    .when('a-3 is reduced from s1', ({ reducer, s1 }) => reducer(s1, incoming(botActivity('a-3', 'three', 3_000))))
    // Before the fix: [a-1, a-2, a-3], the graph had moved on to s2.
    .then('should have a-1 and a-3 only', (_, state) => expect(ids(state)).toEqual(['a-1', 'a-3']))
    .and('should still reduce from s2 as before', ({ reducer, s2 }) =>
      expect(ids(reducer(s2, incoming(botActivity('a-4', 'four', 4_000))))).toEqual(['a-1', 'a-2', 'a-4'])
    );

  bdd
    .given('a reducer with states s0 (empty), s1 (a-1) and s2 (a-1, a-2)', () => {
      const reducer = createGroupedActivitiesReducer(ponyfill, debugAPI);
      const s0 = reducer(undefined, { type: '@@INIT' } as any);
      const s1 = reducer(s0, incoming(botActivity('a-1', 'one', 1_000)));

      reducer(s1, incoming(botActivity('a-2', 'two', 2_000)));

      return { reducer, s0 };
    })
    .when('the same actions are replayed from s0', ({ reducer, s0 }) =>
      reducer(reducer(s0, incoming(botActivity('a-1', 'one', 1_000))), incoming(botActivity('a-2', 'two', 2_000)))
    )
    // Before the fix: [a-1, a-1, a-2], s0 had no ID map entry for a-1 but the graph had its node.
    .then('should have each activity once', (_, state) => expect(ids(state)).toEqual(['a-1', 'a-2']));
});

scenario('a transaction that throws', bdd => {
  bdd
    .given('a-1 in HowTo "h1"', () => {
      const reducer = createGroupedActivitiesReducer(ponyfill, debugAPI);

      return {
        reducer,
        state: reducer(
          reducer(undefined, { type: '@@INIT' } as any),
          incoming(botActivity('a-1', 'one', 1_000, howTo('_:h1')))
        )
      };
    })
    .when('an update of a-1 into "h2" throws, then a-2 arrives', ({ reducer, state }) => {
      let error: unknown;

      try {
        // `NaN` is not valid in a JSON literal: the store throws after a-1 already left "h1" in the transaction.
        reducer(state, incoming(botActivity('a-1', 'one updated', 1_000, { ...howTo('_:h2'), value: NaN })));
      } catch (caught) {
        error = caught;
      }

      return { error, nextState: reducer(state, incoming(botActivity('a-2', 'two', 2_000))) };
    })
    .then('should throw', (_, { error }) => expect(error).toBeInstanceOf(Error))
    // Before the fix: ["two"], the partial edit had detached a-1.
    .and('should keep a-1 as before the failed update', (_, { nextState }) =>
      expect(texts(nextState)).toEqual(['one', 'two'])
    )
    .and('should keep a-1 in "h1"', (_, { nextState }) =>
      expect(nextState.howToGroupingMap.get('_:h1' as any)?.partList).toHaveLength(1)
    );
});

scenario('send status is read from the message node', bdd => {
  bdd
    .given('an outgoing activity, rejected', () => {
      const reducer = createGroupedActivitiesReducer(ponyfill, debugAPI);
      const meta = { clientActivityID: 'c-1', method: 'code' };

      const pending = reducer(reducer(undefined, { type: '@@INIT' } as any), {
        meta,
        payload: {
          activity: {
            channelData: { clientActivityID: 'c-1' },
            from: { id: 'u', role: 'user' },
            text: 'Hello',
            type: 'message'
          }
        },
        type: 'DIRECT_LINE/POST_ACTIVITY_PENDING'
      } as any);

      return reducer(pending, {
        error: true,
        meta,
        payload: new Error('failed'),
        type: 'DIRECT_LINE/POST_ACTIVITY_REJECTED'
      } as any);
    })
    .when('the node and the output are read', state => {
      const [activity] = state.sortedActivities;
      const node = state.graph?.store.getSnapshot().get(activity?.channelData['webchat:internal:local-id'] ?? '');

      return { activity, node };
    })
    .then('should keep the send status on the node', (_, { node }) =>
      expect(node?.['urn:microsoft:webchat:send-status']).toEqual(['send failed'])
    )
    .and('should not keep it in the boxed activity', (_, { node }) =>
      expect(
        (node?.['urn:microsoft:webchat:direct-line-activity:raw-json'] as any)[0]['@value'].channelData
      ).not.toHaveProperty('webchat:send-status')
    )
    .and('should output it in `channelData`, from the node', (_, { activity }) =>
      expect(activity?.channelData['webchat:send-status']).toBe('send failed')
    );
});
