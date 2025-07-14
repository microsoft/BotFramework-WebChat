import PassthroughFallback from './PassthroughFallback';
import DecoratorComposerContext from './DecoratorComposerContext';
import React, { memo, useContext, useMemo, type Context, type ComponentType, type ReactNode } from 'react';
import { ComponentMiddleware, createChainOfResponsibility } from 'react-chain-of-responsibility';
import { middlewareFactoryMarker } from '../../middleware/private/templateMiddleware';

const decoratorChain = createChainOfResponsibility<undefined, any, any>();

export default function templateDecorator<
  const P extends { children?: ReactNode | undefined },
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  const R extends {},
  const Name extends string = string
>(
  name: Name,
  DecoratorRequestContext: Context<{ request: R }>,
  FinalComponent: ComponentType<P> = PassthroughFallback
) {
  type FullProps = P & {
    Next: ComponentType<P>;
    request: R;
  };
  type Middleware = (name: Name) => ReturnType<ComponentMiddleware<undefined, FullProps, typeof name>> | false;

  function buildComponent<T extends P>(
    Component: ComponentType<FullProps>,
    Next: ComponentType<P>
  ): React.ComponentType<T> {
    function ChainNext(props: T) {
      const request = useContext(DecoratorRequestContext)?.request;
      return <Component {...props} Next={Next} request={request} />;
    }

    ChainNext.displayName = `ChainNext(Next ${name})`;
    return memo<T>(ChainNext);
  }

  function createMiddleware(Component: ComponentType<FullProps>): Middleware {
    const factory: Middleware = (init: string): ReturnType<Middleware> | false => {
      if (init !== name) {
        return false;
      }

      return next => () => {
        const Next = next(undefined);
        return Next && buildComponent(Component, Next);
      };
    };

    // This is for checking if the middleware is created via factory function or not.
    // We recommend middleware to be created using factory function.
    factory[middlewareFactoryMarker satisfies symbol] = middlewareFactoryMarker;

    return factory;
  }

  // Reuse global chain, but cast it to the correct type.
  const { Provider: DecoratorChainProvider, useBuildComponentCallback } = decoratorChain as ReturnType<
    typeof createChainOfResponsibility<undefined, P, unknown>
  >;

  function Chain(props: P) {
    const buildMiddleware = useBuildComponentCallback();
    const Proxy = useMemo(() => buildMiddleware(undefined, { fallbackComponent: FinalComponent }), [buildMiddleware]);
    return Proxy && <Proxy {...props} />;
  }

  Chain.displayName = `DecoratorChain(Chain ${name})`;

  const MemoChain = memo<P>(Chain);

  function DecoratorProxy(props: P & Readonly<{ request: R }>) {
    const { request } = props;
    const { middleware } = useContext(DecoratorComposerContext);
    const decoratorMiddleware = useMemo(
      () =>
        middleware
          .map(middleware => middleware(name))
          .filter(enhancer => enhancer)
          // Conversion from internal props to actual middleware stack props.
          .map(enhancer => () => enhancer) as ComponentMiddleware<undefined, P, unknown>[],
      [middleware]
    );

    const value = useMemo(() => ({ request }), [request]);

    return (
      <DecoratorRequestContext.Provider value={value}>
        <DecoratorChainProvider init={name} middleware={decoratorMiddleware}>
          <MemoChain {...props} />
        </DecoratorChainProvider>
      </DecoratorRequestContext.Provider>
    );
  }

  DecoratorProxy.displayName = `DecoratorProxy(Decorator ${name})`;

  return {
    createMiddleware,
    Proxy: memo<P & Readonly<{ request: R }>>(DecoratorProxy),
    // This is for type inference, so we can use it in other files.
    '~types': undefined as unknown as {
      middleware: Middleware;
      request: R;
      props: P;
    }
  };
}

export type InferMiddleware<T extends ReturnType<typeof templateDecorator>> = T['~types']['middleware'];
export type InferProps<T extends ReturnType<typeof templateDecorator>> = T['~types']['props'];
export type InferRequest<T extends ReturnType<typeof templateDecorator>> = T['~types']['request'];
