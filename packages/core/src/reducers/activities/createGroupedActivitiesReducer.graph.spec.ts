/* eslint-disable no-restricted-globals */
// The reducer on the activities graph (William's store): replaying older states, failed transactions, and the send
// status read from the message node, as tests.
import { scenario } from '@testduet/given-when-then';
import createGroupedActivitiesReducer from './createGroupedActivitiesReducer';
import * as toJSONValueModule from './sort/graph/private/toJSONValue';

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

  bdd
    .given('a reducer with states s1 (a-1 updated into HowTo "h1") and s2 (a-1, a-2 in "h1")', () => {
      const reducer = createGroupedActivitiesReducer(ponyfill, debugAPI);
      const s0 = reducer(undefined, { type: '@@INIT' } as any);
      // a-1 is in the graph before "h1": the snapshot lists the part before its parent.
      const s1 = reducer(
        reducer(s0, incoming(botActivity('a-1', 'one', 1_000))),
        incoming(botActivity('a-1', 'one', 1_000, howTo('_:h1')))
      );

      reducer(s1, incoming(botActivity('a-2', 'two', 2_000, howTo('_:h1'))));

      return { reducer, s1 };
    })
    // The graph of s1 is rebuilt from its snapshot: a conversation, a HowTo with a part, and the part.
    .when('a-3 in "h1" is reduced from s1', ({ reducer, s1 }) =>
      reducer(s1, incoming(botActivity('a-3', 'three', 3_000, howTo('_:h1'))))
    )
    .then('should have a-1 and a-3 only', (_, state) => expect(ids(state)).toEqual(['a-1', 'a-3']))
    .and('should keep both in "h1"', (_, state) =>
      expect(state.howToGroupingMap.get('_:h1' as any)?.partList).toHaveLength(2)
    )
    .and('should keep `isPartOf` of both in the store', (_, state) =>
      expect(
        state.sortedActivities.map(
          activity =>
            state.graph?.store.getSnapshot().get(activity.channelData['webchat:internal:local-id'])?.isPartOf?.size
        )
      ).toEqual([1, 1])
    );

  bdd
    .given('s1 (a-1, HowTo "h1" with a-2, a-3) and s2 (a-4 joins "h1": its timestamp moves after a-3)', () => {
      const reducer = createGroupedActivitiesReducer(ponyfill, debugAPI);
      const s1 = [
        botActivity('a-1', 'one', 1_000),
        botActivity('a-2', 'two', 2_000, howTo('_:h1')),
        botActivity('a-3', 'three', 3_000)
      ].reduce((state, activity) => reducer(state, incoming(activity)), reducer(undefined, { type: '@@INIT' } as any));

      reducer(s1, incoming(botActivity('a-4', 'four', 5_000, howTo('_:h1'))));

      return { reducer, s1 };
    })
    .when('a-5 at 4s is reduced from s1', ({ reducer, s1 }) => reducer(s1, incoming(botActivity('a-5', 'five', 4_000))))
    // Before the fix: [a-1, a-5, a-2, a-3], s1 sorted with the timestamp "h1" has in s2 (5s).
    .then('should sort with the timestamp "h1" has in s1 (2s)', (_, state) =>
      expect(ids(state)).toEqual(['a-1', 'a-2', 'a-3', 'a-5'])
    );
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
      // The store rejects `NaN` in a JSON literal. The JSON projection never holds one, so it is injected here: the store
      // throws after a-1 already left "h1" in the transaction.
      const toJSONValueSpy = jest
        .spyOn(toJSONValueModule, 'default')
        .mockImplementationOnce(value => ({ ...(value as object), value: NaN }));

      try {
        reducer(state, incoming(botActivity('a-1', 'one updated', 1_000, howTo('_:h2'))));
      } catch (caught) {
        error = caught;
      } finally {
        toJSONValueSpy.mockRestore();
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

scenario('the activity keeps the host’s objects, as before the store', bdd => {
  bdd
    .given('a card object sent twice, as in `hack.persistValuesMod.html`', () => {
      const reducer = createGroupedActivitiesReducer(ponyfill, debugAPI);
      const card = {
        content: { body: [], type: 'AdaptiveCard' },
        contentType: 'application/vnd.microsoft.card.adaptive'
      };

      return { card, reducer };
    })
    .when('a-1 arrives with the card, then an update of a-1 with the same card', ({ card, reducer }) => {
      const s1 = reducer(
        reducer(undefined, { type: '@@INIT' } as any),
        incoming(botActivity('a-1', 'one', 1_000, { attachments: [card] }))
      );

      return { s1, s2: reducer(s1, incoming(botActivity('a-1', 'one updated', 1_000, { attachments: [card] }))) };
    })
    .then('should output the same card object', ({ card }, { s1, s2 }) => {
      expect(s1.sortedActivities[0]?.attachments?.[0]).toBe(card);
      expect(s2.sortedActivities[0]?.attachments?.[0]).toBe(card);
    })
    .and('should output the same activity object from `activityMap`', (_, { s2 }) => {
      const [activity] = s2.sortedActivities;

      expect(s2.activityMap.get(activity?.channelData['webchat:internal:local-id'] as any)?.activity).toBe(activity);
    })
    .and('should keep a copy in the store', ({ card }, { s2 }) => {
      const [activity] = s2.sortedActivities;
      const node = s2.graph?.store.getSnapshot().get(activity?.channelData['webchat:internal:local-id'] ?? '');
      const boxed = (node?.['urn:microsoft:webchat:direct-line-activity:raw-json'] as any)[0]['@value'];

      expect(boxed.attachments[0]).toEqual(card);
      expect(boxed.attachments[0]).not.toBe(card);
    });
});

scenario('a `Date` in the activity, as `chatAdapter/sequenceId.*.html` send', bdd => {
  bdd
    .given('a reducer', () => createGroupedActivitiesReducer(ponyfill, debugAPI))
    .when('a-2 then a-1 arrive with a `Date` in `timestamp`', reducer => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      const timestamp1 = new Date(1_000);

      try {
        return {
          state: reducer(
            reducer(
              reducer(undefined, { type: '@@INIT' } as any),
              incoming(botActivity('a-2', 'two', 2_000, { timestamp: new Date(2_000) }))
            ),
            incoming(botActivity('a-1', 'one', 1_000, { timestamp: timestamp1 }))
          ),
          timestamp1
        };
      } finally {
        warn.mockRestore();
      }
    })
    .then('should sort by the `Date`', (_, { state }) => expect(ids(state)).toEqual(['a-1', 'a-2']))
    .and('should output the same `Date` object', (_, { state, timestamp1 }) =>
      expect(state.sortedActivities[0]?.timestamp).toBe(timestamp1)
    )
    .and('should keep its ISO string in the store', (_, { state }) => {
      const node = state.graph?.store
        .getSnapshot()
        .get(state.sortedActivities[0]?.channelData['webchat:internal:local-id'] ?? '');

      expect((node?.['urn:microsoft:webchat:direct-line-activity:raw-json'] as any)[0]['@value'].timestamp).toBe(
        '1970-01-01T00:00:01.000Z'
      );
    });
});

scenario('a function in the activity, as `runHook()` in html2 tests sends', bdd => {
  bdd
    .given('a reducer', () => createGroupedActivitiesReducer(ponyfill, debugAPI))
    .when('an event with a function, a counter object and `NaN` arrives', reducer => {
      const fn = () => undefined;
      const ref = { count: 0 };

      return {
        fn,
        ref,
        state: reducer(
          reducer(undefined, { type: '@@INIT' } as any),
          incoming({
            from: { role: 'user' },
            name: '__RUN_HOOK',
            ref,
            timestamp: new Date(0).toISOString(),
            type: 'event',
            value: { fn, nan: NaN }
          })
        )
      };
    })
    .then('should output the same function and objects', (_, { fn, ref, state }) => {
      expect(state.sortedActivities[0]?.value.fn).toBe(fn);
      expect(state.sortedActivities[0]?.ref).toBe(ref);
      expect(state.sortedActivities[0]?.value.nan).toBeNaN();
    })
    .and('should keep the JSON projection in the store', (_, { state }) => {
      const node = state.graph?.store
        .getSnapshot()
        .get(state.sortedActivities[0]?.channelData['webchat:internal:local-id'] ?? '');

      expect((node?.['urn:microsoft:webchat:direct-line-activity:raw-json'] as any)[0]['@value'].value).toEqual({
        nan: null
      });
    });
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
