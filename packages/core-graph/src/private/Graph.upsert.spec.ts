import { expect, jest } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import Graph from './Graph';
import './schemas/private/expectExtendValibot';
import './schemas/private/expectIsFrozen';
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
    .given('a Graph object', () => ({
      graph: new Graph<{ readonly '@id': Identifier; readonly name: string }>(() => () => request => request)
    }))
    .and(
      'spying console.warn()',
      precondition => {
        const warn = jest.spyOn(console, 'warn');

        return { ...precondition, warn };
      },
      ({ warn }) => {
        warn.mockRestore();
      }
    )
    .when('act().upsert() is called twice with node of same @id', ({ graph }) => {
      graph.act(graph => graph.upsert({ '@id': '_:b1', name: 'John Doe' }, { '@id': '_:b1', name: 'Mary Doe' }));
    })
    .then('should throw', ({ warn }) => {
      expect(warn).toHaveBeenCalledWith(
        'botframework-webchat: Should NOT upsert a node multiple times in a single transaction (@id = "_:b1")'
      );
    });
});
