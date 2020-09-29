import applyMiddleware from './applyMiddleware';

const createTypingIndicator = (...middleware) =>
  applyMiddleware('typing indicator middleware', ...middleware, () => () => () => {
    throw new Error(`No renderer for typing indicator`);
  });

export default createTypingIndicator;
