import { warnOnce } from 'botframework-webchat-core';
import { createChainOfResponsibility, type ComponentMiddleware } from 'react-chain-of-responsibility';
import { type EmptyObject } from 'type-fest';
import { any, array, custom, safeParse, type Output } from 'valibot';

export type MiddlewareWithInit<M extends ComponentMiddleware<unknown>, I> = (init: I) => ReturnType<M> | false;

export default function templateMiddleware<Init, Request = any, Props extends {} = EmptyObject>(name: string) {
  type Middleware = ComponentMiddleware<Request, Props>;

  const middlewareSchema = array(
    any([custom<Middleware>(input => typeof input === 'function', 'Middleware must be a function.')])
  );

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

  const initMiddleware = (
    middleware: readonly MiddlewareWithInit<Middleware, Init>[],
    init: Init
  ): readonly Middleware[] =>
    rectifyProps(
      middleware
        .map(middleware => middleware(init))
        .filter((enhancer): enhancer is ReturnType<Middleware> => !!enhancer)
        .map(enhancer => () => enhancer)
    );

  const { Provider, Proxy } = createChainOfResponsibility<Request, Props>();

  Provider.displayName = `${name}Provider`;
  Proxy.displayName = `${name}Proxy`;

  return {
    initMiddleware,
    Provider,
    Proxy,
    types: {
      init: undefined as Init,
      middleware: undefined as Middleware,
      props: undefined as Props,
      request: undefined as Request
    }
  };
}
