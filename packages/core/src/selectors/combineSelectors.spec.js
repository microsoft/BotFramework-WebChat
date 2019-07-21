/* eslint no-magic-numbers: ["error", { "ignore": [1, 2, 3] }] */

import combineSelectors from './combineSelectors';

describe('combineSelectors', () => {
  test('passing map should combine selectors as map', () => {
    const selectorOne = ({ one }) => one;
    const selectorTwo = ({ two }) => two;
    const combined = combineSelectors({
      resultOfOne: selectorOne,
      resultOfTwo: selectorTwo
    });

    const actual = combined({
      one: 1,
      two: 2,
      three: 3
    });

    expect(actual).toEqual({
      resultOfOne: 1,
      resultOfTwo: 2
    });
  });

  test('passing array should combine selectors as array', () => {
    const selectorOne = ({ one }) => one;
    const selectorTwo = ({ two }) => two;
    const combined = combineSelectors([selectorOne, selectorTwo]);

    const actual = combined({
      one: 1,
      two: 2,
      three: 3
    });

    expect(actual).toEqual([1, 2]);
  });
});
