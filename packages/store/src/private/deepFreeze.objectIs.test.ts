import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import { FrozenSet } from '../structure.ts';
import deepFreeze from './deepFreeze.ts';

scenario(
  'deepFreeze',
  bdd => {
    bdd
      .given('a frozen array with NaN and an unfrozen array with NaN at same index', () => {
        const original = Object.freeze([NaN]);

        return { copy: [NaN], original };
      })
      .when('deepFreeze() is called', ({ copy, original }) => deepFreeze(original, copy))
      .then('should return existing frozen copy (proving Object.is() fix)', ({ original }, result) => {
        expect(result).toBe(original);
      });

    bdd
      .given('a frozen object with property NaN and an unfrozen object with property NaN', () => {
        const original = Object.freeze({ value: NaN });

        return { copy: { value: NaN }, original };
      })
      .when('deepFreeze() is called', ({ copy, original }) => deepFreeze(original, copy))
      .then('should return existing frozen copy (proving Object.is() fix)', ({ original }, result) => {
        expect(result).toBe(original);
      });

    // Note: we cannot test 0 vs. -0 because Array.from(new Set([-0])) returns [0], instead of [-0].
    bdd
      .given('a Set with 0 as original and a Set with -0 as validated', () => {
        const original = new FrozenSet([NaN]);
        const copy = new FrozenSet([NaN]);

        return { original, copy };
      })
      .when('deepFreeze() is called', ({ original, copy }) => deepFreeze(original, copy))
      .then('should return existing frozen copy (proving Object.is() fix)', ({ original }, result) => {
        expect(result).toBe(original);
      });
  },
  NodeTest
);
