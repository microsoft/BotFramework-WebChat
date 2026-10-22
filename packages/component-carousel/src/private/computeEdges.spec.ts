/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import computeEdges from './computeEdges';

scenario(
  'computeEdges',
  bdd => {
    bdd
      .given('content as wide as the scrollport', () => ({ maxPosition: 0, position: 0 }))
      .when('computing edges', init => computeEdges(init))
      .then('should not overflow and be at both edges', (_, actual) =>
        expect(actual).toEqual({ atEnd: true, atStart: true, overflowing: false })
      )
      .and('should be frozen', (_, actual) => expect(Object.isFrozen(actual)).toBe(true));

    bdd
      .given('content 1 pixel wider than the scrollport', () => ({ maxPosition: 1, position: 0 }))
      .when('computing edges', init => computeEdges(init))
      .then('should not overflow, within tolerance', (_, actual) =>
        expect(actual).toEqual({ atEnd: true, atStart: true, overflowing: false })
      );

    bdd
      .given('overflowing content scrolled to the start', () => ({ maxPosition: 500, position: 0 }))
      .when('computing edges', init => computeEdges(init))
      .then('should be at the start only', (_, actual) =>
        expect(actual).toEqual({ atEnd: false, atStart: true, overflowing: true })
      );

    bdd
      .given('overflowing content scrolled to the middle', () => ({ maxPosition: 500, position: 250 }))
      .when('computing edges', init => computeEdges(init))
      .then('should be at neither edge', (_, actual) =>
        expect(actual).toEqual({ atEnd: false, atStart: false, overflowing: true })
      );

    bdd
      .given('overflowing content scrolled to 0.4 pixels before the end', () => ({
        maxPosition: 500,
        position: 499.6 // Fractional zoom can stop a fraction of a pixel before the end.
      }))
      .when('computing edges', init => computeEdges(init))
      .then('should be at the end, within tolerance', (_, actual) =>
        expect(actual).toEqual({ atEnd: true, atStart: false, overflowing: true })
      );
  },
  JestGlobals
);
