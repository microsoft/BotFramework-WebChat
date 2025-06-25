import { warnOnce } from 'botframework-webchat-core';
import { createChainOfResponsibility, type ComponentMiddleware } from 'react-chain-of-responsibility';
import { type EmptyObject } from 'type-fest';
import { array, function_, safeParse, type InferOutput } from 'valibot';

type MiddlewareWithInit<M extends ComponentMiddleware<any, any, any>, I> = (init: I) => ReturnType<M> | false;

const arrayOfFunctionSchema = array(function_());
const middlewareFactoryMarker = Symbol();

const isArrayOfFunction = (middleware: unknown): middleware is InferOutput<typeof arrayOfFunctionSchema> =>
  safeParse(arrayOfFunctionSchema, middleware).success;

const EMPTY_ARRAY = Object.freeze([]);

// Following @types/react to use {} for props.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
function templateMiddleware<Request = any, Props extends {} = EmptyObject>(name: string) {
  type Middleware = ComponentMiddleware<Request, Props>;

  const warnInvalid = warnOnce(`"${name}" prop is invalid`);

  const extractMiddleware = (
    middleware: readonly MiddlewareWithInit<ComponentMiddleware<unknown, unknown>, unknown>[] | undefined
  ): readonly Middleware[] => {
    if (middleware) {
      if (isArrayOfFunction(middleware)) {
        // TODO: [P*] We assume middleware is Function[], we should do more checks.
        return Object.freeze(
          middleware
            // TODO: [P*] Checks if the return value is of type function or false.
            .map(middleware => middleware(name) as ReturnType<Middleware> | false)
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

  const createMiddleware = (enhancer: ReturnType<Middleware>): Middleware => {
    const factory = init => init === name && enhancer;

    factory[middlewareFactoryMarker satisfies symbol] = middlewareFactoryMarker;

    return factory;
  };

  return {
    createMiddleware,
    extractMiddleware,
    Provider,
    Proxy,
    '~types': undefined as {
      middleware: Middleware;
      props: Props;
      request: Request;
    }
  };
}

type InferMiddleware<T extends { '~types': { middleware } }> = T['~types']['middleware'];
type InferProps<T extends { '~types': { props } }> = T['~types']['props'];
type InferRequest<T extends { '~types': { request } }> = T['~types']['request'];

export default templateMiddleware;
export { middlewareFactoryMarker, type InferMiddleware, type InferProps, type InferRequest };
