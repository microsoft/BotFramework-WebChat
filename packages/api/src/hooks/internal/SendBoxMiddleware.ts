import templateMiddleware, {
  type InferInit,
  type InferMiddleware,
  type InferProps,
  type InferRequest
} from './private/templateMiddleware';

const template = templateMiddleware<undefined, void, { className?: string | undefined }>('sendBoxMiddleware');

const {
  initMiddleware: initSendBoxMiddleware,
  Provider: SendBoxMiddlewareProvider,
  Proxy: SendBoxMiddlewareProxy,
  '~types': _types
} = template;

type SendBoxMiddleware = InferMiddleware<typeof template>;
type SendBoxMiddlewareInit = InferInit<typeof template>;
type SendBoxMiddlewareProps = InferProps<typeof template>;
type SendBoxMiddlewareRequest = InferRequest<typeof template>;

export {
  initSendBoxMiddleware,
  SendBoxMiddlewareProvider,
  SendBoxMiddlewareProxy,
  type SendBoxMiddleware,
  type SendBoxMiddlewareInit,
  type SendBoxMiddlewareProps,
  type SendBoxMiddlewareRequest
};
