import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import Graph from './Graph';
import type { SlantNode } from './schemas/colorNode';

scenario('Graph class', bdd => {
  bdd
    .given('a graph', () => ({ graph: new Graph() }))
    .and('a node', ({ graph }) => ({
      graph,
      node: { '@id': '_:b1', value: ['abc'] } satisfies SlantNode
    }))
    .and('an observer', condition => ({ ...condition, iterator: condition.graph.observe() }))
    .when('upserted', ({ graph, node }) => {
      graph.upsert(node);
    })
    .then('the graph should have the node', ({ graph }) => {
      expect(Array.from(graph.snapshot().entries())).toEqual([['_:b1', { '@id': '_:b1', value: ['abc'] }]]);
    })
    .and('observer', async ({ iterator }) => {
      const result = await iterator.next();

      expect(result).toEqual({ done: false, value: { ids: ['_:b1'] } });
    });

  bdd
    .given('a graph', () => new Graph())
    .when('upserting 2 nodes with same @id', graph => {
      try {
        graph.upsert({ '@id': '_:b1' } satisfies SlantNode, { '@id': '_:b1' } satisfies SlantNode);
      } catch (error) {
        return error;
      }

      return undefined;
    })
    .then('should throw', (_, error) => {
      expect(() => {
        throw error;
      }).toThrow('Cannot upsert two or more nodes with same @id');
    });
});
