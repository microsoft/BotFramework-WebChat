/* eslint-disable react/require-default-props */

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
import { array, check, function_, parse, pipe, safeParse, type InferOutput } from 'valibot';

const arrayOfFunctionSchema = array(function_());

const isArrayOfFunction = (middleware: unknown): middleware is InferOutput<typeof arrayOfFunctionSchema> =>
  safeParse(arrayOfFunctionSchema, middleware).success;

const BYPASS_ENHANCER: Enhancer<any, any> = next => request => next(request);
const EMPTY_ARRAY = Object.freeze([]);

// Following @types/react to use {} for props.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
function templatePolymiddleware<Request, Props extends {}>(name: string) {
  const { Provider, Proxy, reactComponent, useBuildRenderCallback } = createChainOfResponsibility<
    Request,
    Props,
    string
  >();

  type TemplatedEnhancer = ReturnType<InferOrganicMiddleware<typeof Provider>>;
  type TemplatedMiddleware = (init: string) => TemplatedEnhancer;

  const middlewareFactoryTag = Symbol();

  const middlewareSchema = pipe(
    function_(),
    check(value => value === BYPASS_ENHANCER || middlewareFactoryTag in value)
  );

  const createMiddleware = (enhancer: TemplatedEnhancer): TemplatedMiddleware => {
    parse(function_(`botframework-webchat: ${name} enhancer must be of type function.`), enhancer);

    // Clone the enhancer function and tag it, so we leave the original enhancer as-is.
    const taggedEnhancer = enhancer.bind(undefined);

    // This is for checking if the middleware is created via factory function or not.
    // We enforce middleware to be created using factory function.
    Object.defineProperty(taggedEnhancer, middlewareFactoryTag, { enumerable: false });

    return init => (init === name ? taggedEnhancer : BYPASS_ENHANCER);
  };

  const warnInvalidExtraction = warnOnce(`Middleware passed for extraction of "${name}" must be an array of function`);

  const extractEnhancer = (middleware: readonly TemplatedMiddleware[] | undefined): readonly TemplatedEnhancer[] => {
    if (middleware) {
      if (isArrayOfFunction(middleware)) {
        return Object.freeze(
          middleware
            .map(middleware => {
              const result = middleware(name);

              if (typeof result !== 'function' && result !== false) {
                console.warn(`botframework-webchat: ${name}.middleware must return enhancer function or false`);

                return false;
              } else if (!safeParse(middlewareSchema, result).success) {
                console.warn(`botframework-webchat: ${name}.middleware must be created using its factory function`);

                return false;
              }

              return result;
            })
            .filter((enhancer): enhancer is ReturnType<TemplatedMiddleware> => !!enhancer)
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
    readonly children?: ReactNode | undefined;
    readonly middleware: readonly TemplatedMiddleware[];
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
    extractEnhancer,
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

export default templatePolymiddleware;
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
