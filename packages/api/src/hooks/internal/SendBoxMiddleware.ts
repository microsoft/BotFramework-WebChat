import templateMiddleware from './private/templateMiddleware';

const {
  initMiddleware: initSendBoxMiddleware,
  Provider: SendBoxMiddlewareProvider,
  Proxy: SendBoxMiddlewareProxy,
  types
} = templateMiddleware<void, void, { className?: string | undefined }>('sendBoxMiddleware');

type SendBoxMiddleware = typeof types.middleware;
type SendBoxMiddlewareProps = typeof types.props;
type SendBoxMiddlewareRequest = typeof types.request;

export {
  SendBoxMiddlewareProvider,
  SendBoxMiddlewareProxy,
  initSendBoxMiddleware,
  type SendBoxMiddleware,
  type SendBoxMiddlewareProps,
  type SendBoxMiddlewareRequest
};
