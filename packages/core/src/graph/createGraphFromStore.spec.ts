/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { scenario } from '@testduet/given-when-then';

import createStore from '../createStore';
import createGraphFromStore from './createGraphFromStore';

const incoming = (id: string) => ({
  payload: {
    activity: { channelData: {}, from: { id: 'bot', role: 'bot' }, id, text: id, type: 'message' }
  },
  type: 'DIRECT_LINE/INCOMING_ACTIVITY'
});

type RawJSON = readonly { readonly '@value': { readonly id: string } }[] | undefined;

function activityIdsOf(graph: ReturnType<typeof createGraphFromStore>): readonly string[] {
  return Array.from(graph.getState().values()).flatMap(
    node =>
      (node['urn:microsoft:webchat:direct-line-activity:raw-json'] as RawJSON)?.map(({ '@value': { id } }) => id) ?? []
  );
}

scenario('createGraphFromStore()', bdd => {
  bdd
    .given('a store with an activity, which counts its subscriptions', () => {
      const store = createStore();
      const { subscribe } = store;
      const subscriptions = new Set<() => void>();

      store.subscribe = listener => {
        const unsubscribe = subscribe(listener);
        const subscription = () => {
          subscriptions.delete(subscription);
          unsubscribe();
        };

        subscriptions.add(subscription);

        return subscription;
      };

      store.dispatch(incoming('a-1'));

      return { store, subscriptions };
    })
    .when('a graph is created from the store', ({ store }) => ({ graph: createGraphFromStore(store) }))
    .then('the graph should have the activity, without subscribing to the store', ({ subscriptions }, { graph }) => {
      expect(activityIdsOf(graph)).toEqual(['a-1']);
      expect(subscriptions.size).toBe(0);
    })
    .when('2 subscribers subscribe to the graph', (_, { graph }) => {
      const subscriber1 = jest.fn();
      const subscriber2 = jest.fn();

      return {
        graph,
        subscriber1,
        subscriber2,
        unsubscribe1: graph.subscribe(subscriber1),
        unsubscribe2: graph.subscribe(subscriber2)
      };
    })
    .then('the graph should subscribe to the store once', ({ subscriptions }) => expect(subscriptions.size).toBe(1))
    .when('an activity is received', ({ store }, outcome) => {
      store.dispatch(incoming('a-2'));

      return outcome;
    })
    .then(
      'the graph should have the activity and notify both subscribers',
      (_, { graph, subscriber1, subscriber2 }) => {
        expect(activityIdsOf(graph)).toEqual(['a-1', 'a-2']);
        expect(subscriber1).toHaveBeenCalledTimes(1);
        expect(subscriber2).toHaveBeenCalledTimes(1);
      }
    )
    .when('both subscribers unsubscribe, then an activity is received', ({ store }, outcome) => {
      outcome.unsubscribe1();
      outcome.unsubscribe2();
      store.dispatch(incoming('a-3'));

      return outcome;
    })
    .then('the graph should not follow the store anymore', ({ subscriptions }, { graph, subscriber1 }) => {
      expect(subscriptions.size).toBe(0);
      expect(activityIdsOf(graph)).toEqual(['a-1', 'a-2']);
      expect(subscriber1).toHaveBeenCalledTimes(1);
    })
    .when('a subscriber subscribes again', (_, { graph }) => {
      const subscriber = jest.fn();

      graph.subscribe(subscriber);

      return { graph, subscriber };
    })
    .then(
      'the graph should catch up with the store and notify the subscriber',
      ({ subscriptions }, { graph, subscriber }) => {
        expect(activityIdsOf(graph)).toEqual(['a-1', 'a-2', 'a-3']);
        expect(subscriber).toHaveBeenCalledTimes(1);
        expect(subscriptions.size).toBe(1);
      }
    );
});
