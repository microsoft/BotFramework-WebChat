import templateMiddleware, {
  type InferInit,
  type InferMiddleware,
  type InferProps,
  type InferRequest
} from './private/templateMiddleware';

const template = templateMiddleware<undefined, void, { className?: string | undefined }>('sendBoxToolbarMiddleware');

const {
  initMiddleware: initSendBoxToolbarMiddleware,
  Provider: SendBoxToolbarMiddlewareProvider,
  Proxy: SendBoxToolbarMiddlewareProxy,
  '~types': _types
} = template;

type SendBoxToolbarMiddleware = InferMiddleware<typeof template>;
type SendBoxToolbarMiddlewareInit = InferInit<typeof template>;
type SendBoxToolbarMiddlewareProps = InferProps<typeof template>;
type SendBoxToolbarMiddlewareRequest = InferRequest<typeof template>;

export {
  initSendBoxToolbarMiddleware,
  SendBoxToolbarMiddlewareProvider,
  SendBoxToolbarMiddlewareProxy,
  type SendBoxToolbarMiddleware,
  type SendBoxToolbarMiddlewareInit,
  type SendBoxToolbarMiddlewareProps,
  type SendBoxToolbarMiddlewareRequest
};
