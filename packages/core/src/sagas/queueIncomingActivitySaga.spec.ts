/**
 * @jest-environment @happy-dom/jest-environment
 */
/* eslint-disable no-restricted-globals */
// End-to-end through core's own Redux store and sagas: Direct Line `activity$` → `observeActivitySaga` →
// `queueIncomingActivitySaga` (the reply hold) → `INCOMING_ACTIVITY` → the activities graph (William's store) →
// `state.activities`. Same activities and clock ticks as html2 `__tests__/html2/replyToId/subsequentSetOfActivities.html`.
import { scenario } from '@testduet/given-when-then';
import Observable from 'core-js/features/observable';
import lolex from 'lolex';
import { withOptions } from '../createStore';

const BOT = { id: 'bot', role: 'bot' };

async function flush() {
  // `observeActivitySaga` queues activities through promises.
  for (let index = 0; index < 20; index++) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
}

function createHarness() {
  const clock = lolex.createClock();
  const activityObservers = new Set<{ next: (activity: unknown) => void }>();

  const directLine = {
    activity$: new Observable(observer => {
      activityObservers.add(observer);

      return () => activityObservers.delete(observer);
    }),
    connectionStatus$: new Observable(observer => observer.next(2)),
    end: () => 0,
    postActivity: () => new Observable(() => () => 0)
  };

  const store = withOptions({ ponyfill: clock });

  store.dispatch({
    meta: { userID: 'u-00001', username: 'User' },
    payload: { directLine },
    type: 'DIRECT_LINE/CONNECT_FULFILLING'
  });

  return {
    clock,
    emit: async (activity: unknown) => {
      activityObservers.forEach(observer => observer.next(activity));

      await flush();
    },
    graphNodeIds: () => Array.from(store.getState().groupedActivities.graph.store.getSnapshot().keys()),
    texts: () => store.getState().activities.map(({ text }) => text)
  };
}

scenario('replies held through the sagas, on the activities graph', bdd => {
  bdd
    .given('Web Chat connected, with a bot activity in the transcript', async () => {
      const harness = createHarness();

      await harness.emit({ from: BOT, id: '1.0', text: '1.0', timestamp: new Date(0).toISOString(), type: 'message' });

      return harness;
    })
    .when('at t=1000ms, a reply to a missing activity arrives', async harness => {
      harness.clock.tick(1_000);

      await harness.emit({
        from: BOT,
        id: '2.0',
        replyToId: '0.0',
        text: '2.0',
        timestamp: new Date(1_000).toISOString(),
        type: 'message'
      });

      return harness;
    })
    .then('should not show it yet', (_, harness) => expect(harness.texts()).toEqual(['1.0']))
    .and('should not have it in the graph', (_, harness) =>
      expect(harness.graphNodeIds().some(id => id.includes('2.0'))).toBe(false)
    )
    .when('at t=3000ms, another reply to the same missing activity arrives', async (_, harness) => {
      harness.clock.tick(2_000);

      await harness.emit({
        from: BOT,
        id: '2.1',
        replyToId: '0.0',
        text: '2.1',
        timestamp: new Date(3_000).toISOString(),
        type: 'message'
      });

      return harness;
    })
    .then('should not show either reply yet', (_, harness) => expect(harness.texts()).toEqual(['1.0']))
    .when('at t=6000ms, the first reply times out', async (_, harness) => {
      jest.spyOn(console, 'warn').mockImplementation(() => undefined);

      harness.clock.tick(3_000);

      await flush();

      return harness;
    })
    .then('should show both replies together', (_, harness) => expect(harness.texts()).toEqual(['1.0', '2.0', '2.1']))
    .when('at t=7000ms, a third reply to the same missing activity arrives', async (_, harness) => {
      harness.clock.tick(1_000);

      await harness.emit({
        from: BOT,
        id: '3.0',
        replyToId: '0.0',
        text: '3.0',
        timestamp: new Date(7_000).toISOString(),
        type: 'message'
      });

      return harness;
    })
    // "0.0" is considered lost: replies to it are already in the transcript.
    .then('should show it without delay', (_, harness) =>
      expect(harness.texts()).toEqual(['1.0', '2.0', '2.1', '3.0'])
    );
});

scenario('a reply released by the activity it replies to, through the sagas', bdd => {
  bdd
    .given('Web Chat connected, with a bot activity in the transcript', async () => {
      const harness = createHarness();

      await harness.emit({
        from: BOT,
        id: '1.0',
        text: 'Welcome',
        timestamp: new Date(0).toISOString(),
        type: 'message'
      });

      return harness;
    })
    .when('a reply arrives before the activity it replies to, then the activity', async harness => {
      await harness.emit({
        from: BOT,
        id: '3.0',
        replyToId: '2.0',
        text: 'Answer',
        timestamp: new Date(3_000).toISOString(),
        type: 'message'
      });

      const textsBeforeTarget = harness.texts();

      await harness.emit({
        from: BOT,
        id: '2.0',
        text: 'Question',
        timestamp: new Date(2_000).toISOString(),
        type: 'message'
      });

      return { harness, textsBeforeTarget };
    })
    .then('should hold the reply', (_, { textsBeforeTarget }) => expect(textsBeforeTarget).toEqual(['Welcome']))
    .and('should release the reply right after the activity, without waiting for the timeout', (_, { harness }) =>
      expect(harness.texts()).toEqual(['Welcome', 'Question', 'Answer'])
    );
});
