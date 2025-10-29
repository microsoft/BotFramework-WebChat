import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import Graph from './Graph';
import type { SlantNode } from './schemas/colorNode';

scenario('Graph class', bdd => {
  bdd
    .given('a graph with a Conversation node', () => {
      const graph = new Graph();

      graph.upsert({ '@id': '_:c1', '@type': ['Conversation'] } satisfies SlantNode);

      return { graph };
    })
    .and('an observer', condition => ({ ...condition, iterator: condition.graph.observe() }))
    .when('a Message node is upserted', ({ graph }) => {
      graph.upsert({
        '@id': '_:m1',
        '@type': ['Message'],
        isPartOf: [{ '@id': '_:c1' }],
        text: ['Hello, World!']
      } satisfies SlantNode);
    })
    .then('the graph should have the node', ({ graph }) => {
      expect(Array.from(graph.snapshot().entries())).toEqual([
        ['_:c1', { '@id': '_:c1', '@type': ['Conversation'], hasPart: [{ '@id': '_:m1' }] }],
        ['_:m1', { '@id': '_:m1', '@type': ['Message'], isPartOf: [{ '@id': '_:c1' }], text: ['Hello, World!'] }]
      ]);
    })
    .and('observer should receive both nodes', async ({ iterator }) => {
      await expect(iterator.next()).resolves.toEqual({
        done: false,
        value: {
          ids: ['_:m1', '_:c1']
        }
      });
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
    })
    .and('observer should receive all 3 nodes', async ({ iterator }) => {
      await iterator.next(); // Skip the first change.
      await expect(iterator.next()).resolves.toEqual({
        done: false,
        value: {
          ids: ['_:m2', '_:m3', '_:c1']
        }
      });
    })
    .when('a Message is disconnected from the Conversation', ({ graph }) => {
      graph.upsert({
        '@id': '_:m1',
        '@type': ['Message'],
        text: ['Hello, World!']
      });
    })
    .then('the Conversation.hasPart should have the Message unreferenced', ({ graph }) => {
      expect(Array.from(graph.snapshot().entries())).toEqual([
        [
          '_:c1',
          {
            '@id': '_:c1',
            '@type': ['Conversation'],
            hasPart: [{ '@id': '_:m2' }, { '@id': '_:m3' }]
          }
        ],
        ['_:m1', { '@id': '_:m1', '@type': ['Message'], text: ['Hello, World!'] }],
        ['_:m2', { '@id': '_:m2', '@type': ['Message'], isPartOf: [{ '@id': '_:c1' }], text: ['Aloha!'] }],
        ['_:m3', { '@id': '_:m3', '@type': ['Message'], isPartOf: [{ '@id': '_:c1' }], text: ['Good morning!'] }]
      ]);
    })
    .and('observer should receive the detached Message node and Conversation node', async ({ iterator }) => {
      await iterator.next(); // Skip the first change.
      await iterator.next(); // Skip the second change.
      await expect(iterator.next()).resolves.toEqual({
        done: false,
        value: {
          ids: ['_:m1', '_:c1']
        }
      });
    })
    .when('the Conversation detached all Message', ({ graph }) => {
      graph.upsert({
        '@id': '_:c1',
        '@type': ['Conversation']
      });
    })
    .then('all nodes should be disconnected', ({ graph }) => {
      expect(Array.from(graph.snapshot().entries())).toEqual([
        [
          '_:c1',
          {
            '@id': '_:c1',
            '@type': ['Conversation']
          }
        ],
        ['_:m1', { '@id': '_:m1', '@type': ['Message'], text: ['Hello, World!'] }],
        ['_:m2', { '@id': '_:m2', '@type': ['Message'], text: ['Aloha!'] }],
        ['_:m3', { '@id': '_:m3', '@type': ['Message'], text: ['Good morning!'] }]
      ]);
    })
    .and('observer should receive the detached Message node and Conversation node', async ({ iterator }) => {
      await iterator.next(); // Skip the first change.
      await iterator.next(); // Skip the second change.
      await iterator.next(); // Skip the third change.
      await expect(iterator.next()).resolves.toEqual({
        done: false,
        value: {
          ids: ['_:c1', '_:m2', '_:m3']
        }
      });
    });

  bdd
    .given('a graph with a Conversation node with a Message', () => {
      const graph = new Graph();

      graph.upsert({ '@id': '_:c1', '@type': ['Conversation'] } satisfies SlantNode);
      graph.upsert({
        '@id': '_:m1',
        '@type': ['Message'],
        isPartOf: [{ '@id': '_:c1' }],
        text: ['Hello, World!']
      } satisfies SlantNode);

      return { graph };
    })
    .and('an observer', condition => ({ ...condition, iterator: condition.graph.observe() }))
    .when('the Message node is updated', ({ graph }) => {
      graph.upsert({
        '@id': '_:m1',
        '@type': ['Message'],
        isPartOf: [{ '@id': '_:c1' }],
        text: ['Aloha!']
      } satisfies SlantNode);
    })
    .then('the observer should only return the Message', async ({ iterator }) => {
      await expect(iterator.next()).resolves.toEqual({
        done: false,
        value: { ids: ['_:m1'] }
      });
    });
});
