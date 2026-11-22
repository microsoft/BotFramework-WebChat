import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import * as NodeTest from 'node:test';
import { type BlankNodeIdentifier, type NodeReference } from '../../index.ts';
import createStoreAndController from '../createStoreAndController.ts';

scenario(
  'Both "hasPart" and "isPartOf" does not need to be fixed on insert',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when('both parent and children are inserted', ({ controller }) => {
        controller.edit(transaction => {
          transaction.upsert('_:conversation', () => ({
            '@id': '_:conversation',
            '@type': new Set(['Conversation']),
            hasPart: new Set([{ '@id': '_:m-00001' }, { '@id': '_:m-00002' }])
          }));

          transaction.upsert('_:m-00001', () => ({            '@id': '_:m-00001',
            '@type': new Set(['Message']),
            isPartOf: new Set([{ '@id': '_:conversation' }])
          }));

          transaction.upsert('_:m-00002', () => ({
            '@id': '_:m-00002',
            '@type': new Set(['Message']),
            isPartOf: new Set([{ '@id': '_:conversation' }])
          }));
        });
      })
      .then('the parent node should have `hasPart`', ({ store }) => {
        const parent = store.queryByIdentifier('_:conversation')!;

        expect(parent).toStrictEqual({
          '@id': '_:conversation',
          '@type': expect.any(Set),
          hasPart: expect.any(Set)
        });

        expect(Array.from(parent.hasPart!)).toStrictEqual([
          { '@id': '_:m-00001' satisfies BlankNodeIdentifier } satisfies NodeReference,
          { '@id': '_:m-00002' satisfies BlankNodeIdentifier } satisfies NodeReference
        ]);
      })
      .and('the first child node should have `isPartOf`', ({ store }) => {
        const firstChild = store.queryByIdentifier('_:m-00001')!;

        expect(firstChild).toStrictEqual({
          '@id': '_:m-00001',
          '@type': expect.any(Set),
          isPartOf: expect.any(Set)
        });

        expect(Array.from(firstChild.isPartOf!)).toStrictEqual([
          { '@id': '_:conversation' satisfies BlankNodeIdentifier } satisfies NodeReference
        ]);
      })
      .and('the second child node should have `isPartOf`', ({ store }) => {
        const secondChild = store.queryByIdentifier('_:m-00002')!;

        expect(secondChild).toStrictEqual({
          '@id': '_:m-00002',
          '@type': expect.any(Set),
          isPartOf: expect.any(Set)
        });

        expect(Array.from(secondChild.isPartOf!)).toStrictEqual([
          { '@id': '_:conversation' satisfies BlankNodeIdentifier } satisfies NodeReference
        ]);
      });
  },
  NodeTest
);
