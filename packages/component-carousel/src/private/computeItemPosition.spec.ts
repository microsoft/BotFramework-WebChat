/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import computeItemPosition from './computeItemPosition';

scenario(
  'computeItemPosition',
  bdd => {
    bdd
      .given('an item centered at 600 pixels in a 400-pixel scrollport', () => ({
        clientWidth: 400,
        itemCenter: 600,
        maxPosition: 1000
      }))
      .when('computing the position', init => computeItemPosition(init))
      .then('should scroll the item center to the scrollport center', (_, actual) => expect(actual).toBe(400));

    bdd
      .given('the first item centered at 150 pixels in a 400-pixel scrollport', () => ({
        clientWidth: 400,
        itemCenter: 150,
        maxPosition: 1000
      }))
      .when('computing the position', init => computeItemPosition(init))
      .then('should clamp to the start', (_, actual) => expect(actual).toBe(0));

    bdd
      .given('the last item centered at 1350 pixels in a 400-pixel scrollport', () => ({
        clientWidth: 400,
        itemCenter: 1350,
        maxPosition: 1000
      }))
      .when('computing the position', init => computeItemPosition(init))
      .then('should clamp to the end', (_, actual) => expect(actual).toBe(1000));
  },
  JestGlobals
);
