import ActivityDecoratorRequest from './activityDecoratorRequest';
import templateMiddleware from './templateMiddleware';

const {
  Provider: ActivityBorderDecoratorMiddlewareProvider,
  Proxy: ActivityBorderDecoratorMiddlewareProxy,
  rectifyProps: rectifyActivityBorderDecoratorMiddlewareProps,
  types
} = templateMiddleware<{}, ActivityDecoratorRequest>('ActivityBorderDecoratorMiddleware');

type ActivityBorderDecoratorMiddleware = typeof types.middleware;
type ActivityBorderDecoratorMiddlewareProps = typeof types.props;
type ActivityBorderDecoratorMiddlewareRequest = typeof types.request;

const activityBorderDecoratorTypeName = 'activity border' as const;

export {
  ActivityBorderDecoratorMiddlewareProvider,
  ActivityBorderDecoratorMiddlewareProxy,
  activityBorderDecoratorTypeName,
  rectifyActivityBorderDecoratorMiddlewareProps,
  type ActivityBorderDecoratorMiddleware,
  type ActivityBorderDecoratorMiddlewareProps,
  type ActivityBorderDecoratorMiddlewareRequest
};
