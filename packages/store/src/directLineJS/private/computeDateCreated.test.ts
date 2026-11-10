import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import computeDateCreated from './computeDateCreated.ts';
import type { SortedActivity } from './sortState.ts';

scenario(
  'computeDateCreated()',
  bdd => {
    bdd
      .given('activities with increasing timestamp', (): readonly SortedActivity[] => [
        { id: '_:a1', logicalTimestamp: 1_000 },
        { id: '_:a2', logicalTimestamp: 2_000 }
      ])
      .when('computed', activities => computeDateCreated(activities))
      .then('should use the timestamp', (_, result) => {
        expect(Array.from(result)).toEqual([
          ['_:a1', '1970-01-01T00:00:01.000Z'],
          ['_:a2', '1970-01-01T00:00:02.000Z']
        ]);
      });

    bdd
      .given('activities with same or decreasing timestamp', (): readonly SortedActivity[] => [
        { id: '_:a1', logicalTimestamp: 1_000 },
        { id: '_:a2', logicalTimestamp: 1_000 },
        { id: '_:a3', logicalTimestamp: 500 },
        { id: '_:a4', logicalTimestamp: 1_002 }
      ])
      .when('computed', activities => computeDateCreated(activities))
      .then('should add 1 millisecond to the previous one', (_, result) => {
        expect(Array.from(result.values())).toEqual([
          '1970-01-01T00:00:01.000Z',
          '1970-01-01T00:00:01.001Z',
          '1970-01-01T00:00:01.002Z',
          '1970-01-01T00:00:01.003Z'
        ]);
      });

    bdd
      .given('activities without timestamp', (): readonly SortedActivity[] => [
        { id: '_:a1', logicalTimestamp: undefined },
        { id: '_:a2', logicalTimestamp: 1_000 },
        { id: '_:a3', logicalTimestamp: undefined }
      ])
      .when('computed', activities => computeDateCreated(activities))
      .then('should start from epoch and add 1 millisecond to the previous one', (_, result) => {
        expect(Array.from(result.values())).toEqual([
          '1970-01-01T00:00:00.000Z',
          '1970-01-01T00:00:01.000Z',
          '1970-01-01T00:00:01.001Z'
        ]);
      });

    bdd
      .given('activities with fractional and out-of-range timestamp', (): readonly SortedActivity[] => [
        { id: '_:a1', logicalTimestamp: 1_000.1 },
        { id: '_:a2', logicalTimestamp: -1 },
        { id: '_:a3', logicalTimestamp: Number.MAX_SAFE_INTEGER },
        { id: '_:a4', logicalTimestamp: Number.NaN }
      ])
      .when('computed', activities => computeDateCreated(activities))
      .then('should round up and treat out-of-range timestamp as missing', (_, result) => {
        expect(Array.from(result.values())).toEqual([
          '1970-01-01T00:00:01.001Z',
          '1970-01-01T00:00:01.002Z',
          '1970-01-01T00:00:01.003Z',
          '1970-01-01T00:00:01.004Z'
        ]);
      });

    bdd
      .given('no activities', (): readonly SortedActivity[] => [])
      .when('computed', activities => computeDateCreated(activities))
      .then('should return an empty frozen map', (_, result) => {
        expect(result.size).toBe(0);
        expect(Object.isFrozen(result)).toBe(true);
      });
  },
  NodeTest
);
