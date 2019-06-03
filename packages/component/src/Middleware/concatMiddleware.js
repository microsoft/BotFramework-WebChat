export default function concatMiddleware(...middlewares) {
  return options => {
    const setup = middlewares.reduce((setup, middleware) => (middleware ? [...setup, middleware(options)] : setup), []);

    return last => {
      const stack = setup.slice();
      const work = (...args) => {
        const next = stack.shift();

        return (next ? next(work) : last)(...args);
      };

      return work;
    };
  };
}
