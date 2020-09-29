import applyMiddleware from './applyMiddleware';

const createActivityRenderer = (...middleware) =>
  applyMiddleware('activity middleware', ...middleware);

export default createActivityRenderer;
