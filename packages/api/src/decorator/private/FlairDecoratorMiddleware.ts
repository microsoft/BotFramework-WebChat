import templateMiddleware from './templateMiddleware';

const {
  Provider: FlairDecoratorMiddlewareProvider,
  Proxy: FlairDecoratorMiddlewareProxy,
  rectifyProps: rectifyFlairDecoratorMiddlewareProps,
  types
} = templateMiddleware('FlairDecoratorMiddleware');

type FlairDecoratorMiddleware = typeof types.middleware;
type FlairDecoratorMiddlewareProps = typeof types.props;
type FlairDecoratorMiddlewareRequest = typeof types.request;

export {
  FlairDecoratorMiddlewareProvider,
  FlairDecoratorMiddlewareProxy,
  rectifyFlairDecoratorMiddlewareProps,
  type FlairDecoratorMiddleware,
  type FlairDecoratorMiddlewareProps,
  type FlairDecoratorMiddlewareRequest
};
