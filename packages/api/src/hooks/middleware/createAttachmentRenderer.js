import applyMiddleware from './applyMiddleware';

const createAttachmentRenderer = (...middleware) =>
  applyMiddleware('attachment middleware', ...middleware, () => () => ({ attachment }) => {
    if (attachment) {
      throw new Error(`No renderer for attachment of type "${attachment.contentType}"`);
    } else {
      throw new Error('No attachment to render');
    }
  });

export default createAttachmentRenderer;
