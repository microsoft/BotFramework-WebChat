import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { fn } from 'jest-mock';
import Graph from './Graph2';
import './schemas/private/expectExtendValibot';
import './schemas/private/expectIsFrozen';
import type { Identifier } from './schemas/Identifier';

type Node = {
  readonly '@id': Identifier;
  readonly name: string;
};

scenario('Graph.middleware', bdd => {
  bdd
    .given('a Graph object with a middleware which transform "name" property to uppercase', () => {
      const enhancer = fn<(nodes: ReadonlyMap<Identifier, Node>) => ReadonlyMap<Identifier, Node>>();
      const graph = new Graph<Node>(() => () => nodes => {
        enhancer(nodes);

        const nextNodes = new Map();

        for (const node of nodes.values()) {
          nextNodes.set(node['@id'], { '@id': node['@id'], name: node.name.toUpperCase() });
        }

        return Object.freeze(nextNodes);
      });

      return Object.freeze({ enhancer, graph });
    })
    .when('upsert() is called twice', ({ enhancer, graph }) =>
      graph.act(graph => {
        graph.upsert({
          '@id': '_:b1',
          name: 'John Doe'
        });

        graph.upsert({
          '@id': '_:b2',
          name: 'Mary Doe'
        });

        // Middleware should only be called before commit.
        expect(enhancer).not.toHaveBeenCalled();
      })
    )
    .then('should upsert node "name" in uppercase', ({ graph }) =>
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:b1': {
              '@id': '_:b1',
              name: 'JOHN DOE'
            },
            '_:b2': {
              '@id': '_:b2',
              name: 'MARY DOE'
            }
          })
        )
      )
    )
    .and('middleware should have been called once with 2 nodes', ({ enhancer }) => {
      expect(enhancer).toHaveBeenCalledTimes(1);
      expect(enhancer).toHaveBeenNthCalledWith(
        1,
        new Map(
          Object.entries({
            '_:b1': { '@id': '_:b1', name: 'John Doe' },
            '_:b2': { '@id': '_:b2', name: 'Mary Doe' }
          })
        )
      );
    });

  bdd
    .given(
      'a Graph object with a middleware which split one node into two nodes',
      () =>
        new Graph<Node>(() => () => upsertingNodeMap => {
          const nextNodes = new Map<Identifier, Node>();

          for (const node of upsertingNodeMap.values()) {
            for (const [index, nameToken] of node.name.split(' ').entries()) {
              const id: Identifier = `${node['@id']}/${index}`;

              nextNodes.set(id, { '@id': id, name: nameToken });
            }
          }

          return nextNodes;
        })
    )
    .when('upsert() is called', graph =>
      graph.act(graph =>
        graph.upsert({
          '@id': '_:b1',
          name: 'John Doe'
        })
      )
    )
    .then('should upsert node "name" in uppercase', graph =>
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:b1/0': { '@id': '_:b1/0', name: 'John' },
            '_:b1/1': { '@id': '_:b1/1', name: 'Doe' }
          })
        )
      )
    );

  bdd
    .given(
      'a Graph object with two middleware: transforms "name" property to uppercase and adds greetings',
      () =>
        new Graph<Node>(
          () => next => upsertingNodeMap => {
            const nextUpsertingNodeMap = next(
              new Map(
                upsertingNodeMap.entries().map(([id, node]) => [id, { '@id': node['@id'], name: `"${node.name}"` }])
              )
            );

            return new Map(
              nextUpsertingNodeMap
                .entries()
                .map(([id, node]) => [id, { '@id': node['@id'], name: `My name is ${node.name}.` }])
            );
          },
          () => () => upsertingNodeMap =>
            new Map(
              upsertingNodeMap
                .entries()
                .map(([id, node]) => [id, { '@id': node['@id'], name: node.name.toUpperCase() }])
            )
        )
    )
    .when('upsert() is called', graph =>
      graph.act(graph =>
        graph.upsert({
          '@id': '_:b1',
          name: 'John Doe'
        })
      )
    )
    .then('should upsert node "name" in uppercase', graph =>
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:b1': {
              '@id': '_:b1',
              name: 'My name is "JOHN DOE".'
            }
          })
        )
      )
    );

  bdd
    .given(
      'a Graph object with two middleware that makes request mutable',
      () =>
        new Graph<Node>(
          () => next => upsertingNodeMap => {
            // VERIFY: Make sure request is not mutable.
            expect(upsertingNodeMap).toEqual(expect.isFrozen());

            return next(new Map(upsertingNodeMap));
          },
          () => () => nodes => {
            // VERIFY: Make sure request is not mutable.
            expect(nodes).toEqual(expect.isFrozen());

            return new Map(nodes);
          }
        )
    )
    .when('upsert() is called', graph => {
      try {
        graph.act(graph => graph.upsert({ '@id': '_:b1', name: 'John Doe' }));
      } catch (error) {
        return error;
      }

      return undefined;
    })
    .then('should not throw', (_, error) => expect(error).toBeUndefined());

  type ConversationNode = {
    readonly '@id': `_:c${string}`;
    readonly '@type': 'Conversation';
    hasPart: readonly { readonly '@id': `_:m${string}` }[];
  };

  type MessageNode = {
    readonly '@id': `_:m${string}`;
    readonly '@type': 'Message';
    readonly isPartOf?: { '@id': `_:c${string}` } | undefined;
    readonly text: string;
  };

  bdd
    .given(
      'a Graph object with middleware which link Message node to Conversation node',
      () =>
        new Graph<ConversationNode | MessageNode>(({ getState }) => () => upsertingNodeMap => {
          const conversationNode = getState().get('_:c1');
          const nextUpsertingNodeMap = new Map(upsertingNodeMap);

          if (conversationNode?.['@type'] === 'Conversation') {
            const hasPartIdentifiers = new Set(conversationNode.hasPart.map(node => node['@id']));

            for (const messageNode of upsertingNodeMap
              .values()
              .filter((node): node is MessageNode => node['@type'] === 'Message')) {
              hasPartIdentifiers.add(messageNode['@id']);

              nextUpsertingNodeMap.set(messageNode['@id'], {
                ...messageNode,
                isPartOf: { '@id': conversationNode['@id'] }
              });
            }

            nextUpsertingNodeMap.set(conversationNode['@id'], {
              ...conversationNode,
              hasPart: Array.from(hasPartIdentifiers.values().map(identifier => ({ '@id': identifier })))
            });
          }

          return nextUpsertingNodeMap;
        })
    )
    .when('upsert(ConversationNode) is called', graph => {
      graph.act(graph =>
        graph.upsert({
          '@id': '_:c1',
          '@type': 'Conversation',
          hasPart: Object.freeze([])
        })
      );
    })
    .then('the graph should have Conversation node', graph => {
      expect(graph.getState()).toEqual(
        new Map(Object.entries({ '_:c1': { '@id': '_:c1', '@type': 'Conversation', hasPart: [] } }))
      );
    })
    .when('upsert(MessageNode) is called', graph => {
      graph.act(graph =>
        graph.upsert({
          '@id': '_:m1',
          '@type': 'Message',
          text: 'Hello, World!'
        })
      );
    })
    .then('the graph should have Conversation node linked to the new Message node', graph => {
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:c1': {
              '@id': '_:c1',
              '@type': 'Conversation',
              hasPart: [{ '@id': '_:m1' }]
            },
            '_:m1': {
              '@id': '_:m1',
              '@type': 'Message',
              isPartOf: { '@id': '_:c1' },
              text: 'Hello, World!'
            }
          })
        )
      );
    });

  bdd
    .given('a Graph with a passthrough middleware', () => new Graph(() => next => request => next(request)))
    .when('upserting a node', graph => {
      try {
        graph.act(graph => graph.upsert({ '@id': '_:b1' }));
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
      }).toThrow('At least one middleware must not fallthrough');
    });
});
