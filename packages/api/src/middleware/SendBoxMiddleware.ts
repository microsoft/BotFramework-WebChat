import templateMiddleware, {
  type InferMiddleware,
  type InferProps,
  type InferRequest
} from './private/templateMiddleware';

const template = templateMiddleware<void, { className?: string | undefined }>('sendBoxMiddleware');

const {
  createMiddleware: createSendBoxMiddleware,
  extractMiddleware: extractSendBoxMiddleware,
  Provider: SendBoxMiddlewareProvider,
  Proxy: SendBoxMiddlewareProxy
} = template;

type SendBoxMiddleware = InferMiddleware<typeof template>;
type SendBoxMiddlewareProps = InferProps<typeof template>;
type SendBoxMiddlewareRequest = InferRequest<typeof template>;

export {
  createSendBoxMiddleware,
  extractSendBoxMiddleware,
  SendBoxMiddlewareProvider,
  SendBoxMiddlewareProxy,
  type SendBoxMiddleware,
  type SendBoxMiddlewareProps,
  type SendBoxMiddlewareRequest
};
