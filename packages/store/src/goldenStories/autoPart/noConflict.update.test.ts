import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import assert from 'node:assert';
import * as NodeTest from 'node:test';
import { type BlankNodeIdentifier, type NodeReference } from '../../index.ts';
import createStoreAndController from '../createStoreAndController.ts';

scenario(
  'Both "hasPart" and "isPartOf" does not need to be fixed on update',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when('both parent and children are updated', ({ controller }) => {
        controller.edit(transaction => {
          transaction.upsert('_:conversation', () => ({ '@id': '_:conversation', '@type': new Set(['Conversation']) }));
          transaction.upsert('_:m-00001', () => ({ '@id': '_:m-00001', '@type': new Set(['Message']) }));
          transaction.upsert('_:m-00002', () => ({ '@id': '_:m-00002', '@type': new Set(['Message']) }));
        });

        controller.edit(transaction => {
          transaction.upsert('_:conversation', node => ({
            ...node!,
            hasPart: new Set([{ '@id': '_:m-00001' }, { '@id': '_:m-00002' }])
          }));

          // Intentionally left _:m-00001 unchanged to have auto-fix run in this transaction.

          transaction.upsert('_:m-00002', node => ({
            ...node!,
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

        assert.deepStrictEqual(Array.from(parent.hasPart!), [
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

        assert.deepStrictEqual(Array.from(firstChild.isPartOf!), [
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

        assert.deepStrictEqual(Array.from(secondChild.isPartOf!), [
          { '@id': '_:conversation' satisfies BlankNodeIdentifier } satisfies NodeReference
        ]);
      })
      .and('should have called listener twice', ({ onUpdate }) => {
        assert.equal(onUpdate.mock.callCount(), 2);

        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        assert.deepStrictEqual(Array.from(onUpdate.mock.calls[0]?.arguments[0]!), [
          '_:conversation',
          '_:m-00001',
          '_:m-00002'
        ]);

        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        assert.deepStrictEqual(Array.from(onUpdate.mock.calls[1]?.arguments[0]!).sort(), [
          '_:conversation',
          '_:m-00001',
          '_:m-00002'
        ]);
      });
  },
  NodeTest
);
