import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import createDirectLineStore from './createDirectLineStore.ts';

scenario(
  'start',
  bdd => {
    bdd
      .given('a Direct Line store', () => createDirectLineStore({ token: 'DUMMY' }))
      .when('started', () => {
        // Intentionally left blank.
      })
      .then('should have a single node in the graph', store => {
        expect(store.getSnapshot()).toHaveProperty('size', 1);
      })
      .and('should have a Message node', store => {
        const node = store.getSnapshot().get('_:a-00001');

        expect(node).toEqual({
          '@id': '_:a-00001',
          '@type': expect.any(Set),
          text: ['Hello, World!']
        });
        expect(Array.from(node?.['@type'] ?? [])).toEqual(['Message']);
      });
  },
  NodeTest
);
