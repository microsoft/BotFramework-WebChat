export default function concatMiddleware(...middleware) {
  return setupArgs => {
    const setup = middleware.reduce(
      (setup, middleware) => (middleware ? [...setup, middleware(setupArgs)] : setup),
      []
    );

    return last => {
      const stack = setup.slice();
      const work = index => (...runArgs) => {
        const next = stack[index];

        return (next ? next(work(index + 1)) : last)(...runArgs);
      };

      return work(0);
    };
  };
}
