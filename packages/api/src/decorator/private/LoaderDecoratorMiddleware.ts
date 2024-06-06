import templateMiddleware from './templateMiddleware';

const {
  Provider: LoaderDecoratorMiddlewareProvider,
  Proxy: LoaderDecoratorMiddlewareProxy,
  rectifyProps: rectifyLoaderDecoratorMiddlewareProps,
  types
} = templateMiddleware('LoaderDecoratorMiddleware');

type LoaderDecoratorMiddleware = typeof types.middleware;
type LoaderDecoratorMiddlewareProps = typeof types.props;
type LoaderDecoratorMiddlewareRequest = typeof types.request;

export {
  LoaderDecoratorMiddlewareProvider,
  LoaderDecoratorMiddlewareProxy,
  rectifyLoaderDecoratorMiddlewareProps,
  type LoaderDecoratorMiddleware,
  type LoaderDecoratorMiddlewareProps,
  type LoaderDecoratorMiddlewareRequest
};
