import templateMiddleware from './private/templateMiddleware';

const {
  Provider: SendBoxMiddlewareProvider,
  Proxy: SendBoxMiddlewareProxy,
  rectifyProps: rectifySendBoxMiddlewareProps,
  types
} = templateMiddleware<{ className?: string | undefined }>('sendBoxMiddleware');

type SendBoxMiddleware = typeof types.middleware;
type SendBoxMiddlewareProps = typeof types.props;
type SendBoxMiddlewareRequest = typeof types.request;

export {
  SendBoxMiddlewareProvider,
  SendBoxMiddlewareProxy,
  rectifySendBoxMiddlewareProps,
  type SendBoxMiddleware,
  type SendBoxMiddlewareProps,
  type SendBoxMiddlewareRequest
};
