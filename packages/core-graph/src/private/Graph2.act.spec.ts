import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { assert, object } from 'valibot';
import Graph from './Graph2';
import './schemas/expectExtendValibot';
import './schemas/expectIsFrozen';

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
