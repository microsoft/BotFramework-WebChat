import applyMiddleware from './applyMiddleware';

const createToastRenderer = (...middleware) =>
  applyMiddleware('toast middleware', ...middleware, () => () => ({ notification }) => {
    if (notification) {
      throw new Error(`No renderer for notification of type "${notification.contentType}"`);
    } else {
      throw new Error('No notification to render');
    }
  });

export default createToastRenderer;
