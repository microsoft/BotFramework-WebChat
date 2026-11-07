/* eslint-disable no-restricted-globals */
// The operations of the activities core, one per action of core's reducer (`createGroupedActivitiesReducer.ts`), with the
// inputs that action carries. Core's reducer calls them; the direct adapter (`createActivitiesStore()`) too.
import { scenario } from '@testduet/given-when-then';
import type { ActivitiesCoreState, Activity } from '../types';
import createInitialState from './createInitialState';
import deleteActivityById from './deleteActivityById';
import markActivity from './markActivity';
import postActivityFulfilled from './postActivityFulfilled';
import postActivityImpeded from './postActivityImpeded';
import postActivityPending from './postActivityPending';
import postActivityRejected from './postActivityRejected';
import prepareIncomingActivity from './prepareIncomingActivity';
import receiveActivity from './receiveActivity';

class FixedDate extends Date {
  static now() {
    return 1_000;
  }
}

const env = { Date: FixedDate as DateConstructor };

function botActivity(id: string | undefined, text: string, timestamp: number, extra: Record<string, unknown> = {}) {
  return {
    channelData: {},
    from: { id: 'bot', role: 'bot' },
    ...(id ? { id } : {}),
    text,
    timestamp: new Date(timestamp).toISOString(),
    type: 'message',
    ...extra
  } as unknown as Activity;
}

function userActivity(clientActivityID: string, text: string, extra: Record<string, unknown> = {}) {
  return {
    channelData: { clientActivityID },
    from: { id: 'u', role: 'user' },
    text,
    timestamp: new Date(5_000).toISOString(),
    type: 'message',
    ...extra
  } as unknown as Activity;
}

const ids = (state: ActivitiesCoreState) => state.sortedActivities.map(({ id }) => id);
const texts = (state: ActivitiesCoreState) => state.sortedActivities.map(({ text }) => text);
const channelData = (state: ActivitiesCoreState, index: number) => state.sortedActivities[+index]?.channelData;

scenario('createInitialState()', bdd => {
  bdd
    .given('nothing', () => undefined)
    .when('two initial states are created', () => [createInitialState(), createInitialState()] as const)
    .then('should be empty', (_, [state]) => {
      expect(state.sortedActivities).toEqual([]);
      expect(state.sortedChatHistoryList).toEqual([]);
      expect(state.activityMap.size).toBe(0);
    })
    .and('should have a graph each, created upfront', (_, [state1, state2]) => {
      expect(state1.graph).toBeDefined();
      expect(state1.graph).not.toBe(state2.graph);
    })
    .and('should be frozen', (_, [state]) => expect(Object.isFrozen(state)).toBe(true));
});

scenario('receiveActivity()', bdd => {
  bdd
    .given('an initial state', () => createInitialState())
    .when('a-2, then a-1 (earlier), then an update of a-2 arrive', state =>
      [
        botActivity('a-2', 'two', 2_000),
        botActivity('a-1', 'one', 1_000),
        botActivity('a-2', 'two updated', 2_000)
      ].reduce((state, activity) => receiveActivity(state, activity, env), state)
    )
    .then('should sort by timestamp', (_, state) => expect(ids(state)).toEqual(['a-1', 'a-2']))
    .and('should replace a-2', (_, state) => expect(texts(state)).toEqual(['one', 'two updated']))
    .and('should stamp increasing positions', (_, state) => {
      expect(channelData(state, 0)?.['webchat:internal:position']).toBeLessThan(
        channelData(state, 1)?.['webchat:internal:position'] as number
      );
    })
    .and('should set the received time from `env.Date`', (_, state) =>
      expect(channelData(state, 0)?.['webchat:internal:received-at']).toBe(1_000)
    );

  bdd
    .given('an initial state', () => createInitialState())
    .when('a bot activity with internal fields and no ID arrives', state => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

      try {
        return {
          state: receiveActivity(
            state,
            botActivity(undefined, 'no ID', 1_000, {
              channelData: {
                'webchat:internal:local-id': '_:from-adapter',
                'webchat:internal:position': 1,
                'webchat:send-status': 'sending'
              }
            }),
            env
          ),
          warnings: warn.mock.calls.length
        };
      } finally {
        warn.mockRestore();
      }
    })
    .then('should warn once and assign a random ID', (_, { state, warnings }) => {
      expect(warnings).toBe(1);
      expect(state.sortedActivities[0]?.id).toEqual(expect.any(String));
    })
    .and('should not keep the internal fields from the adapter', (_, { state }) => {
      expect(channelData(state, 0)?.['webchat:internal:local-id']).not.toBe('_:from-adapter');
      expect(channelData(state, 0)?.['webchat:internal:position']).not.toBe(1);
      expect(channelData(state, 0)?.['webchat:send-status']).toBeUndefined();
    });

  bdd
    .given('an outgoing activity c-1, sending', () =>
      postActivityPending(createInitialState(), userActivity('c-1', 'hello'), env)
    )
    .when('its echo and a user activity from the history arrive', state =>
      receiveActivity(
        receiveActivity(state, userActivity('c-1', 'hello echo', { id: 'u-1' }), env),
        userActivity('c-0', 'restored', { id: 'u-0' }),
        env
      )
    )
    .then('should replace the outgoing activity, keeping "sending"', (_, state) => {
      const echo = state.sortedActivities.find(({ id }) => id === 'u-1');

      expect(state.sortedActivities).toHaveLength(2);
      expect(echo?.text).toBe('hello echo');
      expect(echo?.channelData['webchat:send-status']).toBe('sending');
    })
    .and('should mark the restored one "sent"', (_, state) =>
      expect(state.sortedActivities.find(({ id }) => id === 'u-0')?.channelData['webchat:send-status']).toBe('sent')
    );
});

scenario('prepareIncomingActivity()', bdd => {
  bdd
    .given('a-1', () => receiveActivity(createInitialState(), botActivity('a-1', 'one', 1_000), env))
    .when('an update of a-1 is prepared', state => ({
      activity: botActivity('a-1', 'one updated', 1_000),
      prepared: prepareIncomingActivity(state, botActivity('a-1', 'one updated', 1_000), env),
      state
    }))
    .then('should keep the local ID of a-1 and set the received time, without a position', (_, { prepared, state }) =>
      expect(prepared.channelData).toEqual({
        'webchat:internal:local-id': channelData(state, 0)?.['webchat:internal:local-id'],
        'webchat:internal:received-at': 1_000
      })
    )
    .and('should not change the state', (_, { state }) => expect(texts(state)).toEqual(['one']))
    .and('should read as `receiveActivity()` once upserted', (_, { activity, state }) =>
      expect(texts(receiveActivity(state, activity, env))).toEqual(['one updated'])
    );
});

scenario('postActivityPending() and what follows it', bdd => {
  bdd
    .given('an initial state', () => createInitialState())
    .when('c-1 is sent', state => postActivityPending(state, userActivity('c-1', 'hello'), env))
    .then('should add it as "sending"', (_, state) => {
      expect(texts(state)).toEqual(['hello']);
      expect(channelData(state, 0)?.state).toBe('sending');
      expect(channelData(state, 0)?.['webchat:send-status']).toBe('sending');
      expect(channelData(state, 0)?.['webchat:internal:received-at']).toBe(1_000);
    });

  bdd
    .given('c-1, sending', () => postActivityPending(createInitialState(), userActivity('c-1', 'hello'), env))
    .when('it is fulfilled', state => ({
      before: state,
      state: postActivityFulfilled(state, 'c-1', userActivity('c-1', 'hello from service', { id: 'u-1' }), env)
    }))
    .then('should replace it as "sent", at the same position, with the same local ID', (_, { before, state }) => {
      expect(texts(state)).toEqual(['hello from service']);
      expect(channelData(state, 0)?.state).toBe('sent');
      expect(channelData(state, 0)?.['webchat:send-status']).toBe('sent');
      expect(channelData(state, 0)?.['webchat:internal:position']).toBe(
        channelData(before, 0)?.['webchat:internal:position']
      );
      expect(channelData(state, 0)?.['webchat:internal:local-id']).toBe(
        channelData(before, 0)?.['webchat:internal:local-id']
      );
    });

  bdd
    .given('c-1, sending', () => postActivityPending(createInitialState(), userActivity('c-1', 'hello'), env))
    .when('c-2 is fulfilled', state => {
      try {
        postActivityFulfilled(state, 'c-2', userActivity('c-2', 'other', { id: 'u-2' }), env);
      } catch (error) {
        return error;
      }

      return undefined;
    })
    .then('should throw', (_, error) => expect(error).toBeInstanceOf(Error));

  bdd
    .given('c-1, sending', () => postActivityPending(createInitialState(), userActivity('c-1', 'hello'), env))
    .when('it is impeded, and c-2 too', state => ({
      impeded: postActivityImpeded(state, 'c-1'),
      state,
      unknown: postActivityImpeded(state, 'c-2')
    }))
    .then('should mark `channelData.state` only', (_, { impeded }) => {
      expect(channelData(impeded, 0)?.state).toBe('send failed');
      expect(channelData(impeded, 0)?.['webchat:send-status']).toBe('sending');
    })
    .and('should return the same state for c-2', (_, { state, unknown }) => expect(unknown).toBe(state));

  bdd
    .given('c-1, sending', () => postActivityPending(createInitialState(), userActivity('c-1', 'hello'), env))
    .when('it is rejected, and c-2 too', state => ({
      rejected: postActivityRejected(state, 'c-1'),
      state,
      unknown: postActivityRejected(state, 'c-2')
    }))
    .then('should mark it "send failed"', (_, { rejected }) => {
      expect(channelData(rejected, 0)?.state).toBe('send failed');
      expect(channelData(rejected, 0)?.['webchat:send-status']).toBe('send failed');
    })
    .and('should return the same state for c-2', (_, { state, unknown }) => expect(unknown).toBe(state));
});

scenario('deleteActivityById() and markActivity()', bdd => {
  bdd
    .given('a-1 and a-2', () =>
      receiveActivity(
        receiveActivity(createInitialState(), botActivity('a-1', 'one', 1_000), env),
        botActivity('a-2', 'two', 2_000),
        env
      )
    )
    .when('a-1 is deleted, and a-3 too', state => ({
      deleted: deleteActivityById(state, 'a-1'),
      state,
      unknown: deleteActivityById(state, 'a-3')
    }))
    .then('should remove a-1', (_, { deleted }) => expect(ids(deleted)).toEqual(['a-2']))
    .and('should return the same state for a-3', (_, { state, unknown }) => expect(unknown).toBe(state));

  bdd
    .given('a-1', () => receiveActivity(createInitialState(), botActivity('a-1', 'one', 1_000), env))
    .when('a-1 is marked as spoken, a-3 too, and a-1 with a reserved name', state => {
      let error: unknown;

      try {
        markActivity(state, 'a-1', 'webchat:send-status', 'sent');
      } catch (caught) {
        error = caught;
      }

      return {
        error,
        marked: markActivity(state, 'a-1', 'speak', false),
        state,
        unknown: markActivity(state, 'a-3', 'speak', false)
      };
    })
    .then('should set `channelData.speak`', (_, { marked }) => expect(channelData(marked, 0)?.speak).toBe(false))
    .and('should return the same state for a-3', (_, { state, unknown }) => expect(unknown).toBe(state))
    .and('should throw for a reserved name', (_, { error }) => expect(error).toBeInstanceOf(Error));
});
