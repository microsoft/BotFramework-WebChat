import concatMiddleware from './concatMiddleware';

test('concat 2 middleware', () => {
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

  const middleware = concatMiddleware(oddMultiplyByTen, evenMultiplyByHundred);
  const work = middleware()(value => value);

  expect(work(1)).toEqual(10);
  expect(work(2)).toEqual(200);
});

test('run 2 middleware for a single work', () => {
  const combine = () => next => value => {
    return next(value) + next(value + 1);
  };

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

  const middleware = concatMiddleware(combine, oddMultiplyByTen, evenMultiplyByHundred);
  const work = middleware()(value => value);

  expect(work(1)).toEqual(210);
});

test('run a single middleware twice for a single work', () => {
  const combine = () => next => value => {
    return next(value) + next(value + 1);
  };

  const oddMultiplyByTenAndEvenMultiplyByHundred = () => next => value => {
    if (value % 2) {
      return value * 10;
    }

    return value * 100;
  };

  const middleware = concatMiddleware(combine, oddMultiplyByTenAndEvenMultiplyByHundred);
  const work = middleware()(value => value);

  expect(work(1)).toEqual(210);
});
