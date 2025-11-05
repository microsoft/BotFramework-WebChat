import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import Graph from './Graph2';
import './schemas/expectExtendValibot';
import './schemas/expectIsFrozen';
import type { Identifier } from './schemas/Identifier';

scenario('Graph.upsert()', bdd => {
  bdd
    .given(
      'a Graph object',
      () => new Graph<{ readonly '@id': Identifier; readonly name: string }>(() => () => request => request)
    )
    .when('act().upsert() is called', graph => graph.act(graph => graph.upsert({ '@id': '_:b1', name: 'John Doe' })))
    .then('getState() should return the new node', graph =>
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:b1': { '@id': '_:b1', name: 'John Doe' }
          })
        )
      )
    )
    .when('act().upsert() is called with another node', graph =>
      graph.act(graph => graph.upsert({ '@id': '_:b2', name: 'Mary Doe' }))
    )
    .then('getState() should return both nodes', graph =>
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:b1': { '@id': '_:b1', name: 'John Doe' },
            '_:b2': { '@id': '_:b2', name: 'Mary Doe' }
          })
        )
      )
    );

  bdd
    .given(
      'a Graph object',
      () => new Graph<{ readonly '@id': Identifier; readonly name: string }>(() => () => request => request)
    )
    .when('act().upsert() is called twice with node of same @id', graph => {
      try {
        graph.act(graph => graph.upsert({ '@id': '_:b1', name: 'John Doe' }, { '@id': '_:b1', name: 'Mary Doe' }));
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
      }).toThrow('Cannot upsert a node multiple times in a single transaction (@id = "_:b1")');
    });
});
