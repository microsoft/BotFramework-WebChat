import templateMiddleware from './private/templateMiddleware';

const {
  initMiddleware: initSendBoxToolbarMiddleware,
  Provider: SendBoxToolbarMiddlewareProvider,
  Proxy: SendBoxToolbarMiddlewareProxy,
  types
} = templateMiddleware<void, void, { className?: string | undefined }>('sendBoxToolbarMiddleware');

type SendBoxToolbarMiddleware = typeof types.middleware;
type SendBoxToolbarMiddlewareProps = typeof types.props;
type SendBoxToolbarMiddlewareRequest = typeof types.request;

export {
  SendBoxToolbarMiddlewareProvider,
  SendBoxToolbarMiddlewareProxy,
  initSendBoxToolbarMiddleware,
  type SendBoxToolbarMiddleware,
  type SendBoxToolbarMiddlewareProps,
  type SendBoxToolbarMiddlewareRequest
};
