import templateMiddleware from './private/templateMiddleware';

const {
  Provider: SendBoxToolbarMiddlewareProvider,
  Proxy: SendBoxToolbarMiddlewareProxy,
  rectifyProps: rectifySendBoxToolbarMiddlewareProps,
  types
} = templateMiddleware<{ className?: string | undefined }>('sendBoxToolbarMiddleware');

type SendBoxToolbarMiddleware = typeof types.middleware;
type SendBoxToolbarMiddlewareProps = typeof types.props;
type SendBoxToolbarMiddlewareRequest = typeof types.request;

export {
  SendBoxToolbarMiddlewareProvider,
  SendBoxToolbarMiddlewareProxy,
  rectifySendBoxToolbarMiddlewareProps,
  type SendBoxToolbarMiddleware,
  type SendBoxToolbarMiddlewareProps,
  type SendBoxToolbarMiddlewareRequest
};
