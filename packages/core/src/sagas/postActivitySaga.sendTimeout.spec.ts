/**
 * @jest-environment @happy-dom/jest-environment
 */
/* eslint-disable no-restricted-globals */
// End-to-end through core's own Redux store and sagas: `POST_ACTIVITY` → `postActivitySaga` (send timeout) →
// `POST_ACTIVITY_*` → the activities graph (William's store). The send status is kept on the message node
// (`urn:microsoft:webchat:send-status`, pending William) and in `channelData['webchat:send-status']` as before.
//
// Same timings as before: "send failed" (IMPEDED, legacy `channelData.state` only) after `sendTimeout` (20 s by
// default), REJECTED after 300 s. Pinned before by html2 `activityStatus/activityStatus.sendFailed.noEchoBack.html`.
import { scenario } from '@testduet/given-when-then';
import Observable from 'core-js/features/observable';
import lolex from 'lolex';
import { withOptions } from '../createStore';

async function flush() {
  for (let index = 0; index < 20; index++) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
}

function createHarness({ postActivity }: { postActivity: (activity: any) => Observable<string> }) {
  const clock = lolex.createClock();
  const activityObservers = new Set<{ next: (activity: unknown) => void }>();

  const directLine = {
    activity$: new Observable(observer => {
      activityObservers.add(observer);

      return () => activityObservers.delete(observer);
    }),
    connectionStatus$: new Observable(observer => observer.next(2)),
    end: () => 0,
    postActivity
  };

  const store = withOptions({ ponyfill: clock });

  store.dispatch({
    meta: { userID: 'u-00001', username: 'User' },
    payload: { directLine },
    type: 'DIRECT_LINE/CONNECT_FULFILLING'
  });

  const getOutgoing = () => store.getState().activities[0];

  return {
    clock,
    emit: async (activity: unknown) => {
      activityObservers.forEach(observer => observer.next(activity));

      await flush();
    },
    getOutgoing,
    graphSendStatus: () =>
      store
        .getState()
        .groupedActivities.graph.store.getSnapshot()
        .get(getOutgoing().channelData['webchat:internal:local-id'])?.['urn:microsoft:webchat:send-status'],
    post: async () => {
      store.dispatch({
        meta: { method: 'code' },
        payload: { activity: { text: 'Hello, World!', type: 'message' } },
        type: 'DIRECT_LINE/POST_ACTIVITY'
      });

      await flush();
    }
  };
}

scenario('send timeout without echo back, on the activities graph', bdd => {
  bdd
    .given('Web Chat connected to a service that never answers', () =>
      createHarness({ postActivity: () => new Observable(() => () => 0) })
    )
    .when('the user sends a message', async harness => {
      await harness.post();

      return harness;
    })
    .then('should be "sending" in the graph and in the activity', (_, harness) => {
      expect(harness.graphSendStatus()).toEqual(['sending']);
      expect(harness.getOutgoing().channelData['webchat:send-status']).toBe('sending');
    })
    .when('20 seconds pass (default `sendTimeout`)', async (_, harness) => {
      harness.clock.tick(20_000);

      await flush();

      return harness;
    })
    // IMPEDED only changes the legacy `channelData.state`; the UI derives "send failed" from `localTimestamp`.
    .then('should mark the legacy state only', (_, harness) => {
      expect(harness.getOutgoing().channelData.state).toBe('send failed');
      expect(harness.graphSendStatus()).toEqual(['sending']);
    })
    .when('300 seconds passed in total', async (_, harness) => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);

      harness.clock.tick(280_000);

      await flush();

      return harness;
    })
    .then('should be "send failed" in the graph and in the activity', (_, harness) => {
      expect(harness.graphSendStatus()).toEqual(['send failed']);
      expect(harness.getOutgoing().channelData['webchat:send-status']).toBe('send failed');
    });
});

scenario('sent with echo back, on the activities graph', bdd => {
  bdd
    .given('Web Chat connected to a service that answers and echoes back', () =>
      createHarness({
        postActivity: () =>
          new Observable(observer => {
            observer.next('a-00001');
            observer.complete();
          })
      })
    )
    .when('the user sends a message and it is echoed back after 1 second', async harness => {
      await harness.post();

      const { channelData } = harness.getOutgoing();
      const positionBeforeEcho = channelData['webchat:internal:position'];

      harness.clock.tick(1_000);

      await harness.emit({
        channelData: { clientActivityID: channelData.clientActivityID },
        from: { id: 'u-00001' },
        id: 'a-00001',
        text: 'Hello, World!',
        timestamp: new Date(1_000).toISOString(),
        type: 'message'
      });

      return { harness, positionBeforeEcho };
    })
    .then('should be "sent" in the graph and in the activity', (_, { harness }) => {
      expect(harness.graphSendStatus()).toEqual(['sent']);
      expect(harness.getOutgoing().channelData['webchat:send-status']).toBe('sent');
    })
    .and('should keep its position', (_, { harness, positionBeforeEcho }) =>
      expect(harness.getOutgoing().channelData['webchat:internal:position']).toBe(positionBeforeEcho)
    )
    .when('the send timeout passes', async (_, { harness }) => {
      harness.clock.tick(300_000);

      await flush();

      return harness;
    })
    .then('should stay "sent"', (_, harness) => expect(harness.graphSendStatus()).toEqual(['sent']));
});
