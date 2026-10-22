/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import findAdjacentPosition from './findAdjacentPosition';

// 5 items, each 200 pixels apart; the first and the last cannot be centered and are clamped to the edges.
const ITEM_POSITIONS = Object.freeze([0, 100, 300, 500, 600]);

scenario(
  'findAdjacentPosition',
  bdd => {
    bdd
      .given('scrolled to the start', () => 0)
      .when('finding the next item', position => findAdjacentPosition(ITEM_POSITIONS, position, 'next'))
      .then('should return the second item', (_, actual) => expect(actual).toBe(100));

    bdd
      .given('scrolled to the start', () => 0)
      .when('finding the previous item', position => findAdjacentPosition(ITEM_POSITIONS, position, 'previous'))
      .then('should return nothing', (_, actual) => expect(actual).toBeUndefined());

    bdd
      .given('the third item centered', () => 300)
      .when('finding the next item', position => findAdjacentPosition(ITEM_POSITIONS, position, 'next'))
      .then('should return the fourth item', (_, actual) => expect(actual).toBe(500));

    bdd
      .given('the third item centered', () => 300)
      .when('finding the previous item', position => findAdjacentPosition(ITEM_POSITIONS, position, 'previous'))
      .then('should return the second item', (_, actual) => expect(actual).toBe(100));

    bdd
      .given('scrolled between the third and the fourth item', () => 380)
      .when('finding the next item', position => findAdjacentPosition(ITEM_POSITIONS, position, 'next'))
      .then('should return the fourth item', (_, actual) => expect(actual).toBe(500));

    bdd
      .given('scrolled between the third and the fourth item', () => 380)
      .when('finding the previous item', position => findAdjacentPosition(ITEM_POSITIONS, position, 'previous'))
      .then('should return the third item', (_, actual) => expect(actual).toBe(300));

    bdd
      .given('the third item centered, off by 0.5 pixels', () => 300.5) // Within tolerance, e.g. fractional zoom.
      .when('finding the previous item', position => findAdjacentPosition(ITEM_POSITIONS, position, 'previous'))
      .then('should skip the third item and return the second item', (_, actual) => expect(actual).toBe(100));

    bdd
      .given('scrolled to the end', () => 600)
      .when('finding the next item', position => findAdjacentPosition(ITEM_POSITIONS, position, 'next'))
      .then('should return nothing', (_, actual) => expect(actual).toBeUndefined());

    bdd
      .given('scrolled to the end', () => 600)
      .when('finding the previous item', position => findAdjacentPosition(ITEM_POSITIONS, position, 'previous'))
      .then('should return the fourth item', (_, actual) => expect(actual).toBe(500));

    bdd
      .given('no items', () => 0)
      .when('finding the next item', position => findAdjacentPosition([], position, 'next'))
      .then('should return nothing', (_, actual) => expect(actual).toBeUndefined());
  },
  JestGlobals
);
