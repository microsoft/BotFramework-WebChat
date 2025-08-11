import templateMiddleware, {
  type InferMiddleware,
  type InferProps,
  type InferRequest
} from './private/templateMiddleware';

const template = templateMiddleware<void, { className?: string | undefined }>('sendBoxToolbarMiddleware');

const {
  createMiddleware: createSendBoxToolbarMiddleware,
  extractMiddleware: extractSendBoxToolbarMiddleware,
  Provider: SendBoxToolbarMiddlewareProvider,
  Proxy: SendBoxToolbarMiddlewareProxy
} = template;

type SendBoxToolbarMiddleware = InferMiddleware<typeof template>;
type SendBoxToolbarMiddlewareProps = InferProps<typeof template>;
type SendBoxToolbarMiddlewareRequest = InferRequest<typeof template>;

export {
  createSendBoxToolbarMiddleware,
  extractSendBoxToolbarMiddleware,
  SendBoxToolbarMiddlewareProvider,
  SendBoxToolbarMiddlewareProxy,
  type SendBoxToolbarMiddleware,
  type SendBoxToolbarMiddlewareProps,
  type SendBoxToolbarMiddlewareRequest
};
