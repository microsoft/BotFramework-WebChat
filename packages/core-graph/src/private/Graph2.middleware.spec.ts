import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import Graph from './Graph2';
import './schemas/expectExtendValibot';
import './schemas/expectIsFrozen';
import type { Identifier } from './schemas/Identifier';

type Node = {
  readonly '@id': Identifier;
  readonly name: string;
};

scenario('Graph.middleware', bdd => {
  bdd
    .given(
      'a Graph object with a middleware which transform "name" property to uppercase',
      () =>
        new Graph<Node>(
          () => next => nodes => next(nodes.map(node => ({ '@id': node['@id'], name: node.name.toUpperCase() })))
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
              name: 'JOHN DOE'
            }
          })
        )
      )
    );

  bdd
    .given(
      'a Graph object with a middleware which split one node into two nodes',
      () =>
        new Graph<Node>(
          () => next => nodes =>
            next(
              nodes.flatMap(node =>
                node.name.split(' ').map((name, index) => ({ '@id': `${node['@id']}/${index}`, name }))
              )
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
          () => next => nodes => {
            const nextNodes = next(nodes.map(node => ({ '@id': node['@id'], name: `"${node.name}"` })));

            return nextNodes.map(node => ({ '@id': node['@id'], name: `My name is ${node.name}.` }));
          },
          () => next => nodes => next(nodes.map(node => ({ '@id': node['@id'], name: node.name.toUpperCase() })))
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
          () => next => nodes => {
            // VERIFY: Make sure request is not mutable.
            expect(nodes).toEqual(expect.isFrozen());

            return next([...nodes]);
          },
          () => next => nodes => {
            // VERIFY: Make sure request is not mutable.
            expect(nodes).toEqual(expect.isFrozen());

            return next([...nodes]);
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
});
