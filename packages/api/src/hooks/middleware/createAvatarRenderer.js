import applyMiddleware from './applyMiddleware';

const createAvatarRenderer = (...middleware) =>
  applyMiddleware('avatar middleware', ...middleware, () => () => () => false);

export default createAvatarRenderer;
