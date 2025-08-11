import reduceIterable from './reduceIterable';

describe('when called with a summation reducer', () => {
  let reducer: jest.Mock<number, [number, string]>;
  let actual: number;

  beforeEach(() => {
    reducer = jest.fn((intermediate, value) => intermediate + +value);
    actual = reduceIterable(['1', '2', '3'].values(), reducer, 100);
  });

  test('should return summation', () => expect(actual).toBe(106));
  test('should have called reducer 3 times', () => expect(reducer).toHaveBeenCalledTimes(3));
  test("should have called reducer with (100, '1')", () => expect(reducer).toHaveBeenNthCalledWith(1, 100, '1'));
  test("should have called reducer with (101, '2')", () => expect(reducer).toHaveBeenNthCalledWith(2, 101, '2'));
  test("should have called reducer with (103, '3')", () => expect(reducer).toHaveBeenNthCalledWith(3, 103, '3'));
});

describe('when called with an empty array', () => {
  let reducer: jest.Mock<number, [number, string]>;
  let actual: number;

  beforeEach(() => {
    reducer = jest.fn();
    actual = reduceIterable([].values(), reducer, 100);
  });

  test('should return initial value', () => expect(actual).toBe(100));
});
