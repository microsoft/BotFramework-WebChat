import { warnOnce } from 'botframework-webchat-core';
import { createChainOfResponsibility, type ComponentMiddleware } from 'react-chain-of-responsibility';
import { type EmptyObject } from 'type-fest';
import { any, array, custom, safeParse, type Output } from 'valibot';

export default function createMiddlewareFacility<Props extends {} = EmptyObject, Request extends {} = EmptyObject>(
  name: string
) {
  type Middleware = ComponentMiddleware<Request, Props>;

  const validateMiddleware = custom<Middleware>(input => typeof input === 'function', 'Middleware must be a function.');

  const middlewareSchema = array(any([validateMiddleware]));

  const isMiddleware = (middleware: unknown): middleware is Output<typeof middlewareSchema> =>
    safeParse(middlewareSchema, middleware).success;

  const warnInvalid = warnOnce(`"${name}" prop is invalid`);

  const rectifyProps = (middleware: unknown): readonly Middleware[] => {
    if (middleware) {
      if (isMiddleware(middleware)) {
        return Object.isFrozen(middleware) ? middleware : Object.freeze([...middleware]);
      }

      warnInvalid();
    }

    return Object.freeze([]);
  };

  const { Provider, Proxy } = createChainOfResponsibility<Request, Props>();

  Provider.displayName = `${name}Provider`;
  Proxy.displayName = `${name}Proxy`;

  return {
    types: {
      middleware: {} as Middleware,
      props: {} as Props,
      request: {} as Request
    },
    Provider,
    Proxy,
    rectifyProps
  };
}
