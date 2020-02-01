import minOf from './minOf';

describe('minimum of 2 values', () => {
  test('and returning first value', () => {
    const actual = minOf([{ value: 1 }, { value: 2 }], ({ value }) => value);

    expect(actual).toEqual({ value: 1 });
  });

  test('and returning last value', () => {
    const actual = minOf([{ value: 2 }, { value: 1 }], ({ value }) => value);

    expect(actual).toEqual({ value: 1 });
  });
});

describe('predicate returning undefined should be ignored', () => {
  test('with first value undefined', () => {
    const actual = minOf([{}, { value: 1 }, { value: 2 }], ({ value }) => value);

    expect(actual).toEqual({ value: 1 });
  });

  test('with middle value undefined', () => {
    const actual = minOf([{ value: 1 }, {}, { value: 2 }], ({ value }) => value);

    expect(actual).toEqual({ value: 1 });
  });

  test('with last value undefined', () => {
    const actual = minOf([{ value: 1 }, { value: 2 }, {}], ({ value }) => value);

    expect(actual).toEqual({ value: 1 });
  });
});

test('minimum of 2 undefineds', () => {
  const actual = minOf([undefined, undefined]);

  expect(actual).toBeUndefined();
});

test('undefined selector', () => {
  const actual = minOf([1, 2]);

  expect(actual).toBe(1);
});
