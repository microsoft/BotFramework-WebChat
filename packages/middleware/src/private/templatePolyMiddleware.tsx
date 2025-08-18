import { warnOnce } from 'botframework-webchat-core';
import { type Enhancer } from 'handler-chain';
import React, { memo, type ReactNode } from 'react';
import {
  createChainOfResponsibility,
  type ComponentEnhancer,
  type ComponentHandler,
  type ComponentHandlerResult,
  type ComponentRenderer,
  type InferMiddleware as InferOrganicMiddleware,
  type ProviderProps,
  type ProxyProps
} from 'react-chain-of-responsibility/preview';
import { array, function_, safeParse, type InferOutput } from 'valibot';

const arrayOfFunctionSchema = array(function_());

const isArrayOfFunction = (middleware: unknown): middleware is InferOutput<typeof arrayOfFunctionSchema> =>
  safeParse(arrayOfFunctionSchema, middleware).success;

const BYPASS_ENHANCER: Enhancer<any, any> = next => request => next(request);
const EMPTY_ARRAY = Object.freeze([]);

// Following @types/react to use {} for props.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
function templatePolyMiddleware<Request, Props extends {}>(name: string) {
  const { Provider, Proxy, reactComponent, useBuildRenderCallback } = createChainOfResponsibility<
    Request,
    Props,
    string
  >();

  type TemplatedEnhancer = ReturnType<InferOrganicMiddleware<typeof Provider>>;
  type TemplatedMiddleware = (init: string) => TemplatedEnhancer;

  const middlewareFactoryMarker = Symbol();

  const createMiddleware = (enhancer: TemplatedEnhancer): TemplatedMiddleware => {
    const factory: TemplatedMiddleware = init => (init === name ? enhancer : BYPASS_ENHANCER);

    // This is for checking if the middleware is created via factory function or not.
    // We enforce middleware to be created using factory function.

    // TODO: Consider using valibot for validation, plus using "Symbol in object" check.
    (factory as any)[middlewareFactoryMarker satisfies symbol] = middlewareFactoryMarker;

    return factory;
  };

  const warnInvalidExtraction = warnOnce(`Middleware passed for extraction of "${name}" must be an array of function`);

  const extractMiddleware = (
    middleware: readonly TemplatedMiddleware[] | undefined
  ): readonly TemplatedMiddleware[] => {
    if (middleware) {
      if (isArrayOfFunction(middleware)) {
        return Object.freeze(
          middleware
            .map(middleware => {
              if (!(middlewareFactoryMarker in middleware)) {
                console.warn(`botframework-webchat: ${name}.middleware must be created via factory function`);

                return false;
              }

              const result = middleware(name);

              if (typeof result !== 'function' && result) {
                console.warn(`botframework-webchat: ${name}.middleware must return enhancer function or false`);

                return false;
              }

              return result;
            })
            .filter((enhancer): enhancer is ReturnType<TemplatedMiddleware> => !!enhancer)
            .map(enhancer => () => enhancer)
        );
      }

      warnInvalidExtraction();
    }

    return EMPTY_ARRAY;
  };

  // Bind "init" props.
  const TemplatedProvider = memo(function TemplatedProvider({
    children,
    middleware
  }: {
    children?: ReactNode | undefined;
    middleware: readonly TemplatedMiddleware[];
  }) {
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
    Provider: TemplatedProvider as typeof TemplatedProvider & InferenceHelper<Request, Props>,
    Proxy,
    reactComponent,
    useBuildRenderCallback
  };
}

type InferenceHelper<Request, Props extends object> = {
  '~types': {
    handler: ComponentHandler<Request, Props>;
    handlerResult: ComponentHandlerResult<Props>;
    middleware: (init: string) => ComponentEnhancer<Request, Props>;
    props: Props;
    providerProps: ProviderProps<Request, Props, string>;
    proxyProps: ProxyProps<Request, Props>;
    renderer: ComponentRenderer<Props>;
    request: Request;
  };
};

type InferHandler<T extends InferenceHelper<any, any>> = T['~types']['handler'];
type InferHandlerResult<T extends InferenceHelper<any, any>> = T['~types']['handlerResult'];
type InferMiddleware<T extends InferenceHelper<any, any>> = T['~types']['middleware'];
type InferProps<T extends InferenceHelper<any, any>> = T['~types']['props'];
type InferProviderProps<T extends InferenceHelper<any, any>> = T['~types']['providerProps'];
type InferProxyProps<T extends InferenceHelper<any, any>> = T['~types']['proxyProps'];
type InferRenderer<T extends InferenceHelper<any, any>> = T['~types']['renderer'];
type InferRequest<T extends InferenceHelper<any, any>> = T['~types']['request'];

export default templatePolyMiddleware;
export {
  type InferHandler,
  type InferHandlerResult,
  type InferMiddleware,
  type InferProps,
  type InferProviderProps,
  type InferProxyProps,
  type InferRenderer,
  type InferRequest
};
