import applyMiddleware from './applyMiddleware';

const createActivityStatusRenderer = (...middleware) =>
  applyMiddleware('activity status middleware', ...middleware, () => () => () => false);

export default createActivityStatusRenderer;
