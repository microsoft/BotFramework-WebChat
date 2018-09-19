export default function (options, middlewares = []) {
  // TODO: [P4] Refactor this class so we don't actually operate on an Array stack but closure
  middlewares = middlewares.map(middleware => middleware(options));

  return {
    push: middleware => {
      middlewares.push(middleware(options));
    },
    run: (...args) => {
      const stack = [...middlewares];
      const next = (...args) => {
        const middleware = stack.shift();

        if (middleware) {
          return middleware(next)(...args);
        }
      };

      return next(...args);
    }
  };
}
