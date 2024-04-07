import { warnOnce } from 'botframework-webchat-core';
import { createChainOfResponsibility, type ComponentMiddleware } from 'react-chain-of-responsibility';
import { type EmptyObject } from 'type-fest';
import { any, array, custom, safeParse, type Output } from 'valibot';

type SendBoxMiddlewareProps = { className?: string | undefined };
type SendBoxMiddlewareRequest = EmptyObject;
type SendBoxMiddleware = ComponentMiddleware<SendBoxMiddlewareRequest, SendBoxMiddlewareProps>;

const validateSendBoxMiddleware = custom<SendBoxMiddleware>(
  input => typeof input === 'function',
  'Middleware must be a function.'
);

const sendBoxMiddlewareSchema = array(any([validateSendBoxMiddleware]));

const isSendBoxMiddleware = (middleware: unknown): middleware is Output<typeof sendBoxMiddlewareSchema> =>
  safeParse(sendBoxMiddlewareSchema, middleware).success;

const warnInvalid = warnOnce('"sendBoxMiddleware" prop is invalid');

const rectifySendBoxMiddleware = (middleware: unknown): readonly SendBoxMiddleware[] => {
  if (middleware) {
    if (isSendBoxMiddleware(middleware)) {
      return Object.isFrozen(middleware) ? middleware : Object.freeze([...middleware]);
    }

    warnInvalid();
  }

  return Object.freeze([]);
};

const { Provider: SendBoxMiddlewareProvider, Proxy: SendBoxMiddlewareProxy } = createChainOfResponsibility<
  SendBoxMiddlewareRequest,
  SendBoxMiddlewareProps
>();

export {
  SendBoxMiddlewareProvider,
  SendBoxMiddlewareProxy,
  rectifySendBoxMiddleware,
  type SendBoxMiddleware,
  type SendBoxMiddlewareProps,
  type SendBoxMiddlewareRequest
};

// TODO: [P1] Dedupe with SendBoxToolbarMiddleware.
