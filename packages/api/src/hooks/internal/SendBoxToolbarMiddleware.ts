import { warnOnce } from 'botframework-webchat-core';
import { createChainOfResponsibility, type ComponentMiddleware } from 'react-chain-of-responsibility';
import { type EmptyObject } from 'type-fest';
import { any, array, custom, safeParse, type Output } from 'valibot';

type SendBoxToolbarMiddlewareProps = { className?: string | undefined };
type SendBoxToolbarMiddlewareRequest = EmptyObject;
type SendBoxToolbarMiddleware = ComponentMiddleware<SendBoxToolbarMiddlewareRequest, SendBoxToolbarMiddlewareProps>;

const validateSendBoxToolbarMiddleware = custom<SendBoxToolbarMiddleware>(
  input => typeof input === 'function',
  'Middleware must be a function.'
);

const sendBoxToolbarMiddlewareSchema = array(any([validateSendBoxToolbarMiddleware]));

const isSendBoxToolbarMiddleware = (middleware: unknown): middleware is Output<typeof sendBoxToolbarMiddlewareSchema> =>
  safeParse(sendBoxToolbarMiddlewareSchema, middleware).success;

const warnInvalid = warnOnce('botframework-webchat: "sendBoxToolbarMiddleware" prop is invalid.');

const rectifySendBoxToolbarMiddleware = (middleware: unknown): readonly SendBoxToolbarMiddleware[] => {
  if (middleware) {
    if (isSendBoxToolbarMiddleware(middleware)) {
      return Object.isFrozen(middleware) ? middleware : Object.freeze([...middleware]);
    }

    warnInvalid();
  }

  return Object.freeze([]);
};

const { Provider: SendBoxToolbarMiddlewareProvider, Proxy: SendBoxToolbarMiddlewareProxy } =
  createChainOfResponsibility<SendBoxToolbarMiddlewareRequest, SendBoxToolbarMiddlewareProps>();

export {
  SendBoxToolbarMiddlewareProvider,
  SendBoxToolbarMiddlewareProxy,
  rectifySendBoxToolbarMiddleware,
  type SendBoxToolbarMiddleware,
  type SendBoxToolbarMiddlewareProps,
  type SendBoxToolbarMiddlewareRequest
};

// TODO: [P1] Dedupe with SendBoxToolbarToolbarMiddleware.
