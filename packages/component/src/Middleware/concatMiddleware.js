export default function concatMiddleware(...middlewares) {
  return options => {
    const setup = middlewares.reduce((setup, middleware) => (middleware ? [...setup, middleware(options)] : setup), []);

    return last => {
      const stack = setup.slice();
      const work = index => (...args) => {
        const next = stack[index];

        return (next ? next(work(index + 1)) : last)(...args);
      };

      return work(0);
    };
  };
}
