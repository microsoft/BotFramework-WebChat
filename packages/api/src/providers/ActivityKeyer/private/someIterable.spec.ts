import someIterable from './someIterable';

describe('when predicate return true should return true', () => {
  let predicate: jest.Mock<boolean, []>;
  let actual: boolean;

  beforeEach(() => {
    predicate = jest.fn(() => true);
    actual = someIterable(['1', '2', '3'], predicate);
  });

  test('should return true', () => expect(actual).toBe(true));
  test('should have called predicate once', () => expect(predicate).toHaveBeenCalledTimes(1));
  test("should have called predicate with '1'", () => expect(predicate).toHaveBeenNthCalledWith(1, '1'));
});

describe('when predicate return false should return false', () => {
  let predicate: jest.Mock<boolean, []>;
  let actual: boolean;

  beforeEach(() => {
    predicate = jest.fn(() => false);
    actual = someIterable(['1', '2', '3'], predicate);
  });

  test('should return false', () => expect(actual).toBe(false));
  test('should have called predicate 3 times', () => expect(predicate).toHaveBeenCalledTimes(3));
  test("should have called predicate with '1'", () => expect(predicate).toHaveBeenNthCalledWith(1, '1'));
  test("should have called predicate with '2'", () => expect(predicate).toHaveBeenNthCalledWith(2, '2'));
  test("should have called predicate with '3'", () => expect(predicate).toHaveBeenNthCalledWith(3, '3'));
});

describe('when passed an empty array', () => {
  let predicate: jest.Mock<boolean, []>;
  let actual: boolean;

  beforeEach(() => {
    predicate = jest.fn();
    actual = someIterable([], predicate);
  });

  test('should return false', () => expect(actual).toBe(false));
  test('should not call predicate', () => expect(predicate).toHaveBeenCalledTimes(0));
});
