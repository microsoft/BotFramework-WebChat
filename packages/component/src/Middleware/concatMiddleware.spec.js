import concatMiddleware from './concatMiddleware';

describe('two middleware concatenated and ran', () => {
  const oddMultiplyByTen = () => next => value => {
    if (value % 2) {
      return value * 10;
    }

    return next(value);
  };

  const evenMultiplyByHundred = () => next => value => {
    if (!(value % 2)) {
      return value * 100;
    }

    return next(value);
  };

  test('separately', () => {
    const middleware = concatMiddleware(oddMultiplyByTen, evenMultiplyByHundred);
    const work = middleware()(value => value);

    expect(work(1)).toEqual(10);
    expect(work(2)).toEqual(200);
  });

  test('by a single upstream middleware', () => {
    const combine = () => next => value => {
      return next(value) + next(value + 1);
    };

    const middleware = concatMiddleware(combine, oddMultiplyByTen, evenMultiplyByHundred);
    const work = middleware()(value => value);

    expect(work(1)).toEqual(210);
  });
});

test('one middleware ran twice by a single upstream middleware', () => {
  const combine = () => next => value => {
    return next(value) + next(value + 1);
  };

  const oddMultiplyByTenAndEvenMultiplyByHundred = () => () => value => {
    if (value % 2) {
      return value * 10;
    }

    return value * 100;
  };

  const middleware = concatMiddleware(combine, oddMultiplyByTenAndEvenMultiplyByHundred);
  const work = middleware()(value => value);

  expect(work(1)).toEqual(210);
});
