type Work<T> = (...args: any[]) => T;
type Enhancer<T> = (next: Work<T>) => Work<T>;
type Middleware<Setup, Result> = (setup: Setup) => Enhancer<Result>;

export default function concatMiddleware<Setup, Result>(
  ...middleware: Middleware<Setup, Result>[]
): Middleware<Setup, Result> {
  return setupArgs => {
    const setup = middleware.reduce(
      (setup, middleware) => (middleware ? [...setup, middleware(setupArgs)] : setup),
      []
    );

    return last => {
      const stack = setup.slice();
      const work =
        (index: number) =>
        (...runArgs) => {
          // "index" must be a number.
          // eslint-disable-next-line security/detect-object-injection
          const next = stack[index];

          return (next ? next(work(index + 1)) : last)(...runArgs);
        };

      return work(0);
    };
  };
}
