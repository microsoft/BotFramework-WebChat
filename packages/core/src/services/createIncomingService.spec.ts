/**
 * @jest-environment @happy-dom/jest-environment
 */
/* eslint-disable no-restricted-globals */
import { createActivitiesStore } from '@msinternal/botframework-webchat-core-activities';

import createConnectionService from './createConnectionService';
import createIncomingService from './createIncomingService';
import createNotificationsCell from './createNotificationsCell';

function createDirectLine() {
  const calls: string[] = [];
  const activityObservers = new Set<{ next: (value: unknown) => void }>();
  const statusObservers = new Set<{ next: (value: unknown) => void }>();

  return {
    calls,
    directLine: {
      activity$: {
        subscribe: observer => {
          calls.push('activity$.subscribe');
          activityObservers.add(observer);

          return { unsubscribe: () => activityObservers.delete(observer) };
        }
      },
      connectionStatus$: {
        subscribe: observer => {
          calls.push('connectionStatus$.subscribe');
          statusObservers.add(observer);

          return { unsubscribe: () => statusObservers.delete(observer) };
        }
      },
      end: () => calls.push('end')
    },
    emitActivity: (activity: unknown) => activityObservers.forEach(observer => observer.next(activity)),
    emitStatus: (status: number) => statusObservers.forEach(observer => observer.next(status))
  };
}

async function flush() {
  for (let index = 0; index < 10; index++) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
}

function createServices() {
  const ponyfill = { clearTimeout: jest.fn(clearTimeout), Date, setTimeout: jest.fn(setTimeout) };
  const activitiesStore = createActivitiesStore({ ponyfill });
  const notifications = createNotificationsCell({ ponyfill });
  const connection = createConnectionService({ notifications, ponyfill });
  const incoming = createIncomingService({ activitiesStore, connection, ponyfill });

  return { activitiesStore, connection, incoming, notifications, ponyfill };
}

test('construction is inert: no timer, nothing read from Direct Line', () => {
  const { ponyfill } = createServices();

  expect(ponyfill.setTimeout).not.toHaveBeenCalled();
});

test('onActivity() calls the listeners in order, once the activity is in the store', async () => {
  const { activitiesStore, connection, incoming } = createServices();
  const { directLine, emitActivity, emitStatus } = createDirectLine();
  const received: [string, number][] = [];

  const unsubscribe = incoming.onActivity(activity =>
    received.push([activity.id, activitiesStore.getSnapshot().sortedActivities.length])
  );

  connection.connect({ directLine, userID: 'u-1', username: 'User' });
  emitStatus(2);
  await flush();

  emitActivity({ from: { id: 'bot' }, id: 'a', text: 'a', timestamp: new Date(1).toISOString(), type: 'message' });
  emitActivity({ from: { id: 'bot' }, id: 'b', text: 'b', timestamp: new Date(2).toISOString(), type: 'message' });
  await flush();

  unsubscribe();

  emitActivity({ from: { id: 'bot' }, id: 'c', text: 'c', timestamp: new Date(3).toISOString(), type: 'message' });
  await flush();

  expect(received).toEqual([
    ['a', 1],
    ['b', 2]
  ]);
  expect(activitiesStore.getSnapshot().sortedActivities.map(({ from: { role } }) => role)).toEqual([
    'bot',
    'bot',
    'bot'
  ]);

  connection.dispose();
});

test('dispose() stops everything: no further Direct Line call is handled', async () => {
  const { activitiesStore, connection } = createServices();
  const { calls, directLine, emitActivity, emitStatus } = createDirectLine();

  connection.connect({ directLine, userID: 'u-1', username: 'User' });
  emitStatus(2);
  await flush();

  connection.dispose();
  calls.splice(0);

  emitActivity({ from: { id: 'bot' }, id: 'a', text: 'a', timestamp: new Date(1).toISOString(), type: 'message' });
  emitStatus(1);
  connection.connect({ directLine, userID: 'u-1', username: 'User' });
  await flush();

  expect(calls).toEqual([]);
  expect(activitiesStore.getSnapshot().sortedActivities).toEqual([]);
  expect(connection.connectivityStatus.get()).toBe('notconnected');
});
