import ActivityDecoratorRequest from './activityDecoratorRequest';
import templateMiddleware from './templateMiddleware';

const {
  Provider: ActivityBorderDecoratorMiddlewareProvider,
  Proxy: ActivityBorderDecoratorMiddlewareProxy,
  initMiddleware: initActivityBorderDecoratorMiddleware,
  types
} = templateMiddleware<{}, ActivityDecoratorRequest, typeof activityBorderDecoratorTypeName>(
  'ActivityBorderDecoratorMiddleware'
);

type ActivityBorderDecoratorMiddleware = typeof types.middleware;
type ActivityBorderDecoratorMiddlewareProps = typeof types.props;
type ActivityBorderDecoratorMiddlewareRequest = typeof types.request;
type ActivityBorderDecoratorMiddlewareInit = typeof types.init;

const activityBorderDecoratorTypeName = 'activity border' as const;

export {
  ActivityBorderDecoratorMiddlewareProvider,
  ActivityBorderDecoratorMiddlewareProxy,
  activityBorderDecoratorTypeName,
  initActivityBorderDecoratorMiddleware,
  type ActivityBorderDecoratorMiddleware,
  type ActivityBorderDecoratorMiddlewareProps,
  type ActivityBorderDecoratorMiddlewareRequest,
  type ActivityBorderDecoratorMiddlewareInit
};
