import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { fn } from 'jest-mock';
import { GraphSubscriber } from '../Graph2';
import SlantGraph from './SlantGraph';

scenario('SlantGraph auto-inversion', bdd => {
  bdd
    .given('a SlantGraph', () => new SlantGraph())
    .when('upserting 2 nodes with hasPart only', graph =>
      graph.act(graph =>
        graph.upsert(
          {
            '@id': '_:c1',
            '@type': 'Conversation',
            hasPart: [{ '@id': '_:m1' }],
            title: 'Adipisicing voluptate aute mollit culpa nostrud labore ea deserunt nulla culpa nisi ea.'
          },
          {
            '@id': '_:m1',
            '@type': 'MessageLike',
            text: 'Hello, World!'
          }
        )
      )
    )
    .then('should perform auto-inversing', graph =>
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:c1': {
              '@id': '_:c1',
              '@type': ['Conversation'],
              hasPart: [{ '@id': '_:m1' }],
              title: ['Adipisicing voluptate aute mollit culpa nostrud labore ea deserunt nulla culpa nisi ea.']
            },
            '_:m1': {
              '@id': '_:m1',
              '@type': ['MessageLike'],
              isPartOf: [{ '@id': '_:c1' }],
              text: ['Hello, World!']
            }
          })
        )
      )
    );

  bdd
    .given('a SlantGraph', () => new SlantGraph())
    .when('upserting 2 nodes with isPartOf only', graph =>
      graph.act(graph =>
        graph.upsert(
          {
            '@id': '_:c1',
            '@type': 'Conversation',
            abstract: 'Adipisicing voluptate aute mollit culpa nostrud labore ea deserunt nulla culpa nisi ea.'
          },
          {
            '@id': '_:m1',
            '@type': 'MessageLike',
            isPartOf: [{ '@id': '_:c1' }],
            text: 'Hello, World!'
          }
        )
      )
    )
    .then('should perform auto-inversing', graph =>
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:c1': {
              '@id': '_:c1',
              '@type': ['Conversation'],
              abstract: ['Adipisicing voluptate aute mollit culpa nostrud labore ea deserunt nulla culpa nisi ea.'],
              hasPart: [{ '@id': '_:m1' }]
            },
            '_:m1': {
              '@id': '_:m1',
              '@type': ['MessageLike'],
              isPartOf: [{ '@id': '_:c1' }],
              text: ['Hello, World!']
            }
          })
        )
      )
    );
});

scenario('Graph class', bdd => {
  bdd
    .given('a graph with a Conversation node', () => {
      const graph = new SlantGraph();

      graph.act(graph =>
        graph.upsert({
          '@id': '_:c1',
          '@type': ['Conversation'],
          title: ['Once upon a time']
        })
      );

      return { graph };
    })
    .and(
      'a subscriber',
      condition => {
        const subscriber = fn<GraphSubscriber>();
        const unsubscribe = condition.graph.subscribe(subscriber);

        return { ...condition, subscriber, unsubscribe };
      },
      ({ unsubscribe }) => unsubscribe()
    )
    .when('a Message node is upserted', ({ graph }) => {
      graph.act(graph =>
        graph.upsert({
          '@id': '_:m1',
          '@type': ['MessageLike'],
          isPartOf: [{ '@id': '_:c1' }],
          text: ['Hello, World!']
        })
      );
    })
    .then('the graph should have the node', ({ graph }) => {
      expect(Array.from(graph.getState().entries())).toEqual([
        [
          '_:c1',
          { '@id': '_:c1', '@type': ['Conversation'], hasPart: [{ '@id': '_:m1' }], title: ['Once upon a time'] }
        ],
        ['_:m1', { '@id': '_:m1', '@type': ['MessageLike'], isPartOf: [{ '@id': '_:c1' }], text: ['Hello, World!'] }]
      ]);
    })
    .and('observer should receive both nodes', ({ subscriber }) => {
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenNthCalledWith(1, { upsertedNodeIdentifiers: new Set(['_:m1', '_:c1']) });
    })
    .when('two more Message nodes are upserted', ({ graph }) => {
      graph.act(graph =>
        graph.upsert(
          {
            '@id': '_:m2',
            '@type': ['MessageLike'],
            isPartOf: [{ '@id': '_:c1' }],
            text: ['Aloha!']
          },
          {
            '@id': '_:m3',
            '@type': ['MessageLike'],
            isPartOf: [{ '@id': '_:c1' }],
            text: ['Good morning!']
          }
        )
      );
    })
    .then('the graph should have the node', ({ graph }) => {
      expect(Array.from(graph.getState().entries())).toEqual([
        [
          '_:c1',
          {
            '@id': '_:c1',
            '@type': ['Conversation'],
            hasPart: [{ '@id': '_:m1' }, { '@id': '_:m2' }, { '@id': '_:m3' }],
            title: ['Once upon a time']
          }
        ],
        ['_:m1', { '@id': '_:m1', '@type': ['MessageLike'], isPartOf: [{ '@id': '_:c1' }], text: ['Hello, World!'] }],
        ['_:m2', { '@id': '_:m2', '@type': ['MessageLike'], isPartOf: [{ '@id': '_:c1' }], text: ['Aloha!'] }],
        ['_:m3', { '@id': '_:m3', '@type': ['MessageLike'], isPartOf: [{ '@id': '_:c1' }], text: ['Good morning!'] }]
      ]);
    })
    .and('observer should receive all 3 nodes', ({ subscriber }) => {
      expect(subscriber).toHaveBeenCalledTimes(2);
      expect(subscriber).toHaveBeenNthCalledWith(2, { upsertedNodeIdentifiers: new Set(['_:m2', '_:m3', '_:c1']) });
    })
    .when('a Message is disconnected from the Conversation', ({ graph }) => {
      graph.act(graph =>
        graph.upsert({
          '@id': '_:m1',
          '@type': ['MessageLike'],
          text: ['Hello, World!']
        })
      );
    })
    .then('the Conversation.hasPart should have the Message unreferenced', ({ graph }) => {
      expect(Array.from(graph.getState().entries())).toEqual([
        [
          '_:c1',
          {
            '@id': '_:c1',
            '@type': ['Conversation'],
            hasPart: [{ '@id': '_:m2' }, { '@id': '_:m3' }],
            title: ['Once upon a time']
          }
        ],
        ['_:m1', { '@id': '_:m1', '@type': ['MessageLike'], text: ['Hello, World!'] }],
        ['_:m2', { '@id': '_:m2', '@type': ['MessageLike'], isPartOf: [{ '@id': '_:c1' }], text: ['Aloha!'] }],
        ['_:m3', { '@id': '_:m3', '@type': ['MessageLike'], isPartOf: [{ '@id': '_:c1' }], text: ['Good morning!'] }]
      ]);
    })
    .and('observer should receive the detached Message node and Conversation node', ({ subscriber }) => {
      expect(subscriber).toHaveBeenCalledTimes(3);
      expect(subscriber).toHaveBeenNthCalledWith(3, { upsertedNodeIdentifiers: new Set(['_:m1', '_:c1']) });
    })
    .when('the Conversation detached all Message', ({ graph }) => {
      graph.act(graph =>
        graph.upsert({
          '@id': '_:c1',
          '@type': ['Conversation'],
          title: ['Once upon a time']
        })
      );
    })
    .then('all nodes should be disconnected', ({ graph }) => {
      expect(Array.from(graph.getState().entries())).toEqual([
        [
          '_:c1',
          {
            '@id': '_:c1',
            '@type': ['Conversation'],
            title: ['Once upon a time']
          }
        ],
        ['_:m1', { '@id': '_:m1', '@type': ['MessageLike'], text: ['Hello, World!'] }],
        ['_:m2', { '@id': '_:m2', '@type': ['MessageLike'], text: ['Aloha!'] }],
        ['_:m3', { '@id': '_:m3', '@type': ['MessageLike'], text: ['Good morning!'] }]
      ]);
    })
    .and('observer should receive the detached Message node and Conversation node', ({ subscriber }) => {
      expect(subscriber).toHaveBeenCalledTimes(4);
      expect(subscriber).toHaveBeenNthCalledWith(4, { upsertedNodeIdentifiers: new Set(['_:c1', '_:m2', '_:m3']) });
    });

  // TODO: [P*] Add a child with a non-existing parent, should throw.
  // TODO: [P*] Add a child with a parent upserted after the child.
  // TODO: [P*] Add a parent with a non-existing child, should throw.
  // TODO: [P*] Add a parent with a child upserted after the parent.

  bdd
    .given('a graph with a Conversation node with a Message', () => {
      const graph = new SlantGraph();

      graph.act(graph => {
        graph.upsert({
          '@id': '_:c1',
          '@type': ['Conversation'],
          title: 'Once upon a time'
        });

        graph.upsert({
          '@id': '_:m1',
          '@type': ['MessageLike'],
          isPartOf: [{ '@id': '_:c1' }],
          text: ['Hello, World!']
        });
      });

      return { graph };
    })
    .and(
      'a subscriber',
      condition => {
        const subscriber = fn<GraphSubscriber>();
        const unsubscribe = condition.graph.subscribe(subscriber);

        return { ...condition, subscriber, unsubscribe };
      },
      ({ unsubscribe }) => unsubscribe()
    )
    .when('the Message node is updated', ({ graph }) => {
      graph.act(graph =>
        graph.upsert({
          '@id': '_:m1',
          '@type': ['MessageLike'],
          isPartOf: [{ '@id': '_:c1' }],
          text: ['Aloha!']
        })
      );
    })
    .then('the observer should only return the Message', ({ subscriber }) => {
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenNthCalledWith(1, { upsertedNodeIdentifiers: new Set(['_:m1']) });
    });
});
