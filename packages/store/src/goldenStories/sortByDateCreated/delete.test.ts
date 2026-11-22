import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import * as NodeTest from 'node:test';
import createStoreAndController from '../createStoreAndController.ts';

scenario(
  'Updated nodes are sorted by "dateCreated" property',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .and('two children nodes are upserted under the same parent', precondition => {
        precondition.controller.edit(transaction => {
          transaction.upsert('_:conversation', () => ({
            '@id': '_:conversation',
            '@type': new Set(['Message'])
          }));
        });

        precondition.controller.edit(transaction => {
          transaction.upsert('_:m-00001', () => ({
            '@id': '_:m-00001',
            '@type': new Set(['Message']),
            dateCreated: '2026-11-21T00:00:01.000Z',
            isPartOf: new Set([{ '@id': '_:conversation' }]),
            text: ['Hello, World!']
          }));

          transaction.upsert('_:m-00002', () => ({
            '@id': '_:m-00002',
            '@type': new Set(['Message']),
            dateCreated: '2026-11-21T00:00:02.000Z',
            isPartOf: new Set([{ '@id': '_:conversation' }]),
            text: ['Aloha!']
          }));
        });

        return precondition;
      })
      .and('the first child node is deleted', precondition => {
        precondition.controller.edit(transaction => {
          transaction.delete('_:m-00001');
        });

        return precondition;
      })
      .when('query the children nodes with sort', ({ store }) =>
        Array.from(store.getSortedParts('_:conversation', { by: 'dateCreated' }))
      )
      .then('should have first child removed from the sort result', ({ store }, sorted) => {
        expect(sorted).toStrictEqual([expect.objectContaining({ '@id': '_:m-00002' })]);

        expect(sorted).toStrictEqual([store.queryByIdentifier('_:m-00002')]);
      })
      .and('should have first child removed from the "hasPart" property', ({ store }) => {
        expect(Array.from(store.queryByIdentifier('_:conversation')!.hasPart!)).toStrictEqual([{ '@id': '_:m-00002' }]);
      });
  },
  NodeTest
);
