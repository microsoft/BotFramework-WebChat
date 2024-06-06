import React, { type ReactNode, useMemo } from 'react';
import { FlairDecoratorMiddlewareProvider, type FlairDecoratorMiddleware } from './FlairDecoratorMiddleware';
import { LoaderDecoratorMiddleware, LoaderDecoratorMiddlewareProvider } from './LoaderDecoratorMiddleware';

type DecoratorMiddlewareByInit = {
  flair: FlairDecoratorMiddleware;
  loader: LoaderDecoratorMiddleware;
};

type DecoratorMiddlewareInit = 'flair' | 'loader';

export type DecoratorComposerComponent = (
  props: Readonly<{
    children: ReactNode;
    middleware: DecoratorMiddleware[];
  }>
) => React.JSX.Element;

export type DecoratorMiddleware = (
  init: DecoratorMiddlewareInit
) => ReturnType<FlairDecoratorMiddleware | LoaderDecoratorMiddleware> | false;

const initMiddlewares = <Init extends DecoratorMiddlewareInit>(
  middleware: DecoratorMiddleware[],
  init: Init
): DecoratorMiddlewareByInit[Init][] =>
  middleware
    .map(md => md(init))
    .filter((enhancer): enhancer is ReturnType<DecoratorMiddlewareByInit[Init]> => !!enhancer)
    .map(enhancer => () => enhancer);

export default (): DecoratorComposerComponent =>
  ({ children, middleware }) => {
    const flairMiddlewares = useMemo(() => initMiddlewares(middleware, 'flair'), [middleware]);
    const loaderMiddlewares = useMemo(() => initMiddlewares(middleware, 'loader'), [middleware]);

    return (
      <FlairDecoratorMiddlewareProvider middleware={flairMiddlewares}>
        <LoaderDecoratorMiddlewareProvider middleware={loaderMiddlewares}>{children}</LoaderDecoratorMiddlewareProvider>
      </FlairDecoratorMiddlewareProvider>
    );
  };
