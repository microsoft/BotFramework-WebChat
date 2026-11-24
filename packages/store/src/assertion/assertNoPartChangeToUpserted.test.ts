import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import type { NodeIdentifier } from '../node/NodeIdentifier.ts';
import assertNoPartChangeToUpserted from './assertNoPartChangeToUpserted.ts';

/** Creates a set which throws when iterated, to make sure it is not scanned. */
function createUnscannableSet(ids: readonly NodeIdentifier[]): ReadonlySet<NodeIdentifier> {
  const set = new Set(ids);

  Object.defineProperty(set, Symbol.iterator, {
    value: () => {
      throw new Error('Set must not be scanned');
    }
  });

  return set;
}

scenario(
  'assertNoPartChangeToUpserted',
  bdd => {
    bdd
      .given('unchanged hasPart and isPartOf which must not be scanned', () => {
        const childIds = createUnscannableSet(['_:c-1', '_:c-2']);
        const parentIds = createUnscannableSet(['_:p-1', '_:p-2']);

        return Object.freeze({
          childIds,
          id: '_:m-1',
          parentIds,
          pendingChildIds: new Set<NodeIdentifier>(),
          pendingParentIds: new Set<NodeIdentifier>(),
          prevParentIds: parentIds,
          shownChildIds: childIds,
          upsertedIds: new Set<NodeIdentifier>(['_:c-1', '_:p-1'])
        });
      })
      .when('the assertion is called', options => () => assertNoPartChangeToUpserted(options))
      .then('should not throw', (_, fn) => expect(fn).not.toThrow());

    bdd
      .given('hasPart with an added child upserted in the same transaction', () =>
        Object.freeze({
          childIds: new Set<NodeIdentifier>(['_:c-1']),
          id: '_:m-1',
          parentIds: new Set<NodeIdentifier>(),
          pendingChildIds: new Set<NodeIdentifier>(),
          pendingParentIds: new Set<NodeIdentifier>(),
          prevParentIds: new Set<NodeIdentifier>(),
          shownChildIds: new Set<NodeIdentifier>(),
          upsertedIds: new Set<NodeIdentifier>(['_:c-1'])
        })
      )
      .when('the assertion is called', options => () => assertNoPartChangeToUpserted(options))
      .then('should throw', (_, fn) =>
        expect(fn).toThrow('Node "_:c-1" must be part of "_:m-1" in isPartOf, as "_:m-1" has part of it')
      );

    bdd
      .given('isPartOf with a removed parent upserted in the same transaction', () =>
        Object.freeze({
          childIds: new Set<NodeIdentifier>(),
          id: '_:m-1',
          parentIds: new Set<NodeIdentifier>(),
          pendingChildIds: new Set<NodeIdentifier>(),
          pendingParentIds: new Set<NodeIdentifier>(),
          prevParentIds: new Set<NodeIdentifier>(['_:p-1']),
          shownChildIds: new Set<NodeIdentifier>(),
          upsertedIds: new Set<NodeIdentifier>(['_:p-1'])
        })
      )
      .when('the assertion is called', options => () => assertNoPartChangeToUpserted(options))
      .then('should throw', (_, fn) =>
        expect(fn).toThrow('Node "_:p-1" must not have part "_:m-1" in hasPart, as "_:m-1" is not part of it')
      );
  },
  NodeTest
);
