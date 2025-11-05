import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { fn } from 'jest-mock';
import { assert, object } from 'valibot';
import Graph, { stateSchema, type State } from './Graph2';
import './schemas/expectExtendValibot';
import './schemas/expectIsFrozen';

scenario('Graph.getState()', bdd => {
  bdd
    .given('a Graph object', () => new Graph())
    .when('getState() is called', graph => graph.getState())
    .then('should return empty Map', (_, state) => expect(state).toBeInstanceOf(Map))
    .and('should return frozen', (_, state) => expect(Object.isFrozen(state)).toBe(true));
});

scenario('Graph.act()', bdd => {
  bdd
    .given('a Graph object', () => new Graph())
    .when('act() is called twice nested', graph => {
      try {
        graph.act(() => {
          graph.act(() => {
            // Intentionally left blank.
          });
        });
      } catch (error) {
        return { error };
      }

      return {};
    })
    .then('should throw', (_, { error }) => {
      // Because the writable graph does not support parallel writes.
      expect(() => {
        if (error) {
          throw error;
        }
      }).toThrow('Another transaction is ongoing');
    });

  bdd
    .given('a Graph object', () => new Graph())
    .when('act() is called', graph => {
      let writableGraph;

      graph.act(graph => {
        writableGraph = graph;
      });

      assert(object({}), writableGraph);

      return writableGraph;
    })
    .then('the writableGraph argument should not have act', (_, writableGraph) =>
      // Because the writable graph does not support writes in a nested manner.
      expect('act' in writableGraph).toBe(false)
    )
    .and('the writableGraph argument should not have subscribe', (_, writableGraph) =>
      // Because the writable graph should be short-lived.
      expect('subscribe' in writableGraph).toBe(false)
    );
});

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
      let returnValue: State | undefined;

      graph.act(({ getState, upsert }) => {
        upsert({ '@id': '_:b1', '@type': ['Thing'] });

        returnValue = getState();
      });

      assert(stateSchema, returnValue);

      return returnValue;
    })
    .then('subscriber should have been called once', ({ subscriber }) => expect(subscriber).toHaveBeenCalledTimes(1))
    .and('subscriber should have been called with changed node identifiers', ({ subscriber }) =>
      expect(subscriber).toHaveBeenNthCalledWith(1, new Set(['_:b1']))
    )
    .and('subscriber should have been called with frozen node identifiers', ({ subscriber }) =>
      expect(subscriber).toHaveBeenNthCalledWith(1, expect.isFrozen())
    )
    .and('getState() should have the newly added node', ({ graph }) => {
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:b1': {
              '@id': '_:b1',
              '@type': ['Thing']
            }
          })
        )
      );

      expect(graph.getState()).toEqual(expect.isFrozen());
    })
    .and('should support dirty read', (_, dirtyGraph) => {
      expect(dirtyGraph).toEqual(
        new Map(
          Object.entries({
            '_:b1': {
              '@id': '_:b1',
              '@type': ['Thing']
            }
          })
        )
      );

      expect(dirtyGraph).toEqual(expect.isFrozen());
    })
    .when('unsubscribe() is called', ({ unsubscribe }) => unsubscribe())
    .then('act().snapshot() should not call subscriber', ({ graph, subscriber }) => {
      expect(subscriber).toHaveBeenCalledTimes(1); // Subscriber have been called once previously, so it should kept at 1.

      graph.act(graph => graph.upsert({ '@id': '_:b1', '@type': ['Thing'] }));

      expect(subscriber).toHaveBeenCalledTimes(1);
    });
});

scenario('Graph.upsert()', bdd => {
  bdd
    .given('a Graph object', () => new Graph())
    .when('act().upsert() is called', graph =>
      graph.act(graph => graph.upsert({ '@id': '_:b1', '@type': ['Person'], name: 'John Doe' }))
    )
    .then('getState() should return the new node', graph =>
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:b1': { '@id': '_:b1', '@type': ['Person'], name: 'John Doe' }
          })
        )
      )
    )
    .when('act().upsert() is called with another node', graph =>
      graph.act(graph => graph.upsert({ '@id': '_:b2', '@type': ['Person'], name: 'Mary Doe' }))
    )
    .then('getState() should return both nodes', graph =>
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:b1': { '@id': '_:b1', '@type': ['Person'], name: 'John Doe' },
            '_:b2': { '@id': '_:b2', '@type': ['Person'], name: 'Mary Doe' }
          })
        )
      )
    );
});
