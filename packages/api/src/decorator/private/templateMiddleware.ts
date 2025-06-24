import { warnOnce } from 'botframework-webchat-core';
import { createChainOfResponsibility, type ComponentMiddleware } from 'react-chain-of-responsibility';
import { type EmptyObject } from 'type-fest';
import { any, array, function_, pipe, safeParse, type InferOutput } from 'valibot';

type MiddlewareWithInit<M extends ComponentMiddleware<any, any, any>, I> = (init: I) => ReturnType<M> | false;

const EMPTY_ARRAY = Object.freeze([]);

// Following @types/react to use {} for props.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
function templateMiddleware<Init extends string, Request = any, Props extends {} = EmptyObject>(name: string) {
  type Middleware = ComponentMiddleware<Request, Props>;

  const middlewareSchema = array(pipe(any(), function_()));

  const isMiddleware = (middleware: unknown): middleware is InferOutput<typeof middlewareSchema> =>
    safeParse(middlewareSchema, middleware).success;

  const warnInvalid = warnOnce(`"${name}" prop is invalid`);

  const initMiddleware = (
    middleware: readonly MiddlewareWithInit<ComponentMiddleware<unknown, unknown>, unknown>[],
    init: unknown
  ): readonly Middleware[] => {
    if (middleware) {
      if (isMiddleware(middleware)) {
        return Object.freeze(
          middleware
            .map(middleware => middleware(init) as ReturnType<Middleware>)
            .filter((enhancer): enhancer is ReturnType<Middleware> => !!enhancer)
            .map(enhancer => () => enhancer)
        );
      }

      warnInvalid();
    }

    return EMPTY_ARRAY;
  };

  const { Provider, Proxy } = createChainOfResponsibility<Request, Props>();

  Provider.displayName = `${name}Provider`;
  Proxy.displayName = `${name}Proxy`;

  return {
    initMiddleware,
    Provider,
    Proxy,
    '~types': undefined as {
      init: Init;
      middleware: Middleware;
      props: Props;
      request: Request;
    }
  };
}

type InferMiddleware<T extends { '~types': { middleware } }> = T['~types']['middleware'];
type InferInit<T extends { '~types': { init } }> = T['~types']['init'];
type InferProps<T extends { '~types': { props } }> = T['~types']['props'];
type InferRequest<T extends { '~types': { request } }> = T['~types']['request'];

export default templateMiddleware;
export { type InferInit, type InferMiddleware, type InferProps, type InferRequest, type MiddlewareWithInit };
