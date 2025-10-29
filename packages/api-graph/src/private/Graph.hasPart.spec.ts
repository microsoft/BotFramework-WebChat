import { scenario } from '@testduet/given-when-then';
import Graph from './Graph';
import type { ExpandedFlatNodeObject } from './schemas/expandArray';

scenario('Graph class', bdd => {
  bdd
    .given('a graph with a Conversation node', () => {
      const graph = new Graph();

      graph.upsert({ '@id': '_:c1', '@type': ['Conversation'] } satisfies ExpandedFlatNodeObject);

      return { graph };
    })
    .and('an observer', condition => ({ ...condition, iterator: condition.graph.observe() }))
    .when('a Message node is upserted', ({ graph }) => {
      graph.upsert({
        '@id': '_:m1',
        '@type': ['Message'],
        isPartOf: [{ '@id': '_:c1' }],
        text: ['Hello, World!']
      } satisfies ExpandedFlatNodeObject);
    })
    .then('the graph should have the node', ({ graph }) => {
      expect(Array.from(graph.snapshot().entries())).toEqual([
        ['_:c1', { '@id': '_:c1', '@type': ['Conversation'], hasPart: [{ '@id': '_:m1' }] }],
        ['_:m1', { '@id': '_:m1', '@type': ['Message'], isPartOf: [{ '@id': '_:c1' }], text: ['Hello, World!'] }]
      ]);
    })
    .when('two more Message nodes are upserted', ({ graph }) => {
      graph.upsert(
        {
          '@id': '_:m2',
          '@type': ['Message'],
          isPartOf: [{ '@id': '_:c1' }],
          text: ['Aloha!']
        },
        {
          '@id': '_:m3',
          '@type': ['Message'],
          isPartOf: [{ '@id': '_:c1' }],
          text: ['Good morning!']
        }
      );
    })
    .then('the graph should have the node', ({ graph }) => {
      expect(Array.from(graph.snapshot().entries())).toEqual([
        [
          '_:c1',
          {
            '@id': '_:c1',
            '@type': ['Conversation'],
            hasPart: [{ '@id': '_:m1' }, { '@id': '_:m2' }, { '@id': '_:m3' }]
          }
        ],
        ['_:m1', { '@id': '_:m1', '@type': ['Message'], isPartOf: [{ '@id': '_:c1' }], text: ['Hello, World!'] }],
        ['_:m2', { '@id': '_:m2', '@type': ['Message'], isPartOf: [{ '@id': '_:c1' }], text: ['Aloha!'] }],
        ['_:m3', { '@id': '_:m3', '@type': ['Message'], isPartOf: [{ '@id': '_:c1' }], text: ['Good morning!'] }]
      ]);
    });
});
