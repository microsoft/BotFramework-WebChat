import { type EmptyObject } from 'type-fest';

import { type ActivityDecoratorRequest } from './ActivityDecoratorRequest';
import templateMiddleware from './templateMiddleware';

const {
  initMiddleware: initActivityBorderDecoratorMiddleware,
  Provider: ActivityBorderDecoratorMiddlewareProvider,
  Proxy: ActivityBorderDecoratorMiddlewareProxy,
  // False positive, `types` is used for its typing.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  types
} = templateMiddleware<typeof activityBorderDecoratorTypeName, ActivityDecoratorRequest, EmptyObject>(
  'ActivityBorderDecoratorMiddleware'
);

type ActivityBorderDecoratorMiddleware = typeof types.middleware;
type ActivityBorderDecoratorMiddlewareInit = typeof types.init;
type ActivityBorderDecoratorMiddlewareProps = typeof types.props;
type ActivityBorderDecoratorMiddlewareRequest = typeof types.request;

const activityBorderDecoratorTypeName = 'activity border' as const;

export {
  ActivityBorderDecoratorMiddlewareProvider,
  ActivityBorderDecoratorMiddlewareProxy,
  activityBorderDecoratorTypeName,
  initActivityBorderDecoratorMiddleware,
  type ActivityBorderDecoratorMiddleware,
  type ActivityBorderDecoratorMiddlewareInit,
  type ActivityBorderDecoratorMiddlewareProps,
  type ActivityBorderDecoratorMiddlewareRequest
};
