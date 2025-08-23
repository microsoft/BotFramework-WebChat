import { warnOnce } from 'botframework-webchat-core';
import React, { memo, type ReactNode } from 'react';
import { createChainOfResponsibility, type ComponentMiddleware } from 'react-chain-of-responsibility';
import { array, function_, safeParse, type InferOutput } from 'valibot';

type MiddlewareWithInit<M extends ComponentMiddleware<any, any, any>, I> = (init: I) => ReturnType<M> | false;

const arrayOfFunctionSchema = array(function_());

/** @deprecated New middleware should use `templatePolymiddleware`. */
const middlewareFactoryMarker = Symbol();

const isArrayOfFunction = (middleware: unknown): middleware is InferOutput<typeof arrayOfFunctionSchema> =>
  safeParse(arrayOfFunctionSchema, middleware).success;

const EMPTY_ARRAY = Object.freeze([]);

/** @deprecated New middleware should use `templatePolymiddleware`. */
// Following @types/react to use {} for props.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
function templateMiddleware<Request, Props extends {}>(name: string) {
  type Middleware = ComponentMiddleware<Request, Props, string>;

  const createMiddleware = (enhancer: ReturnType<Middleware>): Middleware => {
    const factory: Middleware = init => init === name && enhancer;

    // This is for checking if the middleware is created via factory function or not.
    // We recommend middleware to be created using factory function.
    factory[middlewareFactoryMarker satisfies symbol] = middlewareFactoryMarker;

    return factory;
  };

  const warnInvalidExtraction = warnOnce(`Middleware passed for extraction of "${name}" must be an array of function`);

  const extractMiddleware = (
    middleware: readonly MiddlewareWithInit<ComponentMiddleware<unknown, unknown>, string>[] | undefined
  ): readonly Middleware[] => {
    if (middleware) {
      if (isArrayOfFunction(middleware)) {
        return Object.freeze(
          middleware
            .map(middleware => {
              const result = middleware(name);

              if (typeof result !== 'function' && result !== false) {
                console.warn(`botframework-webchat: ${name}.middleware must return enhancer function or false`);

                return false;
              }

              return result;
            })
            .filter((enhancer): enhancer is ReturnType<Middleware> => !!enhancer)
            .map(enhancer => () => enhancer)
        );
      }

      warnInvalidExtraction();
    }

    return EMPTY_ARRAY;
  };

  const { Provider, Proxy } = createChainOfResponsibility<Request, Props, string>();

  type TemplatedProviderProps = {
    readonly children?: ReactNode | undefined;
    readonly middleware: readonly Middleware[];
  };

  // eslint-disable-next-line prefer-arrow-callback
  const TemplatedProvider = memo(function TemplatedProvider({ children, middleware }: TemplatedProviderProps) {
    return (
      <Provider init={name} middleware={middleware}>
        {children}
      </Provider>
    );
  });

  TemplatedProvider.displayName = `${name}Provider`;

  Proxy.displayName = `${name}Proxy`;

  return {
    createMiddleware,
    extractMiddleware,
    Provider: TemplatedProvider,
    Proxy,
    '~types': undefined as {
      middleware: Middleware;
      props: Props;
      request: Request;
    }
  };
}

/** @deprecated New middleware should use `templatePolymiddleware`. */
type InferMiddleware<T extends { '~types': { middleware } }> = T['~types']['middleware'];
/** @deprecated New middleware should use `templatePolymiddleware`. */
type InferProps<T extends { '~types': { props } }> = T['~types']['props'];
/** @deprecated New middleware should use `templatePolymiddleware`. */
type InferRequest<T extends { '~types': { request } }> = T['~types']['request'];

export default templateMiddleware;
export { middlewareFactoryMarker, type InferMiddleware, type InferProps, type InferRequest };
