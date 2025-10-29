import { scenario } from '@testduet/given-when-then';
import Graph from './Graph';
import type { ExpandedFlatNodeObject } from './schemas/expandArray';

scenario('Graph class', bdd => {
  bdd
    .given('a graph', () => ({ graph: new Graph() }))
    .and('a node', ({ graph }) => ({
      graph,
      node: { '@id': '_:b1', value: ['abc'] } satisfies ExpandedFlatNodeObject
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

      expect(result).toEqual({ done: false, value: [{ '@id': '_:b1', value: ['abc'] }] });
    });
});
