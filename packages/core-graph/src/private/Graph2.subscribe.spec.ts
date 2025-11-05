import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { fn } from 'jest-mock';
import { assert, map, string, unknown } from 'valibot';
import Graph, { type GraphState } from './Graph2';
import './schemas/expectExtendValibot';
import './schemas/expectIsFrozen';

scenario('Graph.subscribe()', bdd => {
  bdd
    .given('a Graph object and a subscriber', () => {
      const graph = new Graph();
      const subscriber = fn();

      graph.subscribe(subscriber);

      return { graph, subscriber };
    })
    .when('act().getState() is called', ({ graph }) => {
      let returnValue;

      graph.act(({ getState }) => {
        returnValue = getState();
      });

      return returnValue;
    })
    .then('context.state should be of type Map', (_, state) => expect(state).toBeInstanceOf(Map))
    .and('context.state should be frozen', (_, state) => expect(Object.isFrozen(state)).toBe(true))
    .and('subscriber should not have been called', ({ subscriber }) =>
      // Because there are no changes.
      expect(subscriber).not.toHaveBeenCalled()
    );

  bdd
    .given('a Graph object and a subscriber', () => {
      const graph = new Graph();
      const subscriber = fn();
      const unsubscribe = graph.subscribe(subscriber);

      return { graph, subscriber, unsubscribe };
    })
    .when('act().upsert() is called', ({ graph }) => {
      let returnValue: GraphState | undefined;

      graph.act(({ getState, upsert }) => {
        upsert({ '@id': '_:b1' });

        returnValue = getState();
      });

      assert(map(string(), unknown()), returnValue);

      return returnValue;
    })
    .then('subscriber should have been called once', ({ subscriber }) => expect(subscriber).toHaveBeenCalledTimes(1))
    .and('subscriber should have been called with changed node identifiers', ({ subscriber }) =>
      expect(subscriber).toHaveBeenNthCalledWith(1, { upsertedNodeIdentifiers: new Set(['_:b1']) })
    )
    .and('subscriber should have been called with frozen', ({ subscriber }) => {
      expect(subscriber).toHaveBeenNthCalledWith(1, expect.isFrozen());
      expect(subscriber).toHaveBeenNthCalledWith(1, { upsertedNodeIdentifiers: expect.isFrozen() });
    })
    .and('getState() should have the newly added node', ({ graph }) =>
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:b1': {
              '@id': '_:b1'
            }
          })
        )
      )
    )
    .and('getState() should be frozen', ({ graph }) => expect(graph.getState()).toEqual(expect.isFrozen()))
    .and('getState() alled during act() should not do dirty read', (_, dirtyGraph) => {
      expect(dirtyGraph).toEqual(new Map());
      expect(dirtyGraph).toEqual(expect.isFrozen());
    })
    .when('unsubscribe() is called', ({ unsubscribe }) => unsubscribe())
    .then('act().snapshot() should not call subscriber', ({ graph, subscriber }) => {
      expect(subscriber).toHaveBeenCalledTimes(1); // Subscriber have been called once previously, so it should kept at 1.

      graph.act(graph => graph.upsert({ '@id': '_:b1' }));

      expect(subscriber).toHaveBeenCalledTimes(1);
    });

  bdd
    .given('a Graph object and a subscriber which will call act() when triggered', () => {
      const graph = new Graph();
      const subscriber = fn(() => {
        // Should throw.
        graph.act(() => {
          // Intentionally left blank.
        });
      });

      graph.subscribe(subscriber);

      return { graph, subscriber };
    })
    .when('act().upsert() is called', ({ graph }) => {
      try {
        graph.act(({ upsert }) => {
          upsert({ '@id': '_:b1' });
        });
      } catch (error) {
        return error;
      }

      return undefined;
    })
    .then('should throw', (_, error) => {
      expect(() => {
        if (error) {
          throw error;
        }
      }).toThrow('Another transaction is ongoing');
    });
});
