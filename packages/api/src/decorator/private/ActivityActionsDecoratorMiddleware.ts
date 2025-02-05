import { type EmptyObject } from 'type-fest';

import ActivityDecoratorRequest from './activityDecoratorRequest';
import templateMiddleware from './templateMiddleware';

const {
  initMiddleware: initActivityActionsDecoratorMiddleware,
  Provider: ActivityActionsDecoratorMiddlewareProvider,
  Proxy: ActivityActionsDecoratorMiddlewareProxy,
  types
} = templateMiddleware<typeof activityActionsDecoratorTypeName, ActivityDecoratorRequest, EmptyObject>(
  'ActivityActionsDecoratorMiddleware'
);

type ActivityActionsDecoratorMiddleware = typeof types.middleware;
type ActivityActionsDecoratorMiddlewareInit = typeof types.init;
type ActivityActionsDecoratorMiddlewareProps = typeof types.props;
type ActivityActionsDecoratorMiddlewareRequest = typeof types.request;

const activityActionsDecoratorTypeName = 'activity actions' as const;

export {
  ActivityActionsDecoratorMiddlewareProvider,
  ActivityActionsDecoratorMiddlewareProxy,
  activityActionsDecoratorTypeName,
  initActivityActionsDecoratorMiddleware,
  type ActivityActionsDecoratorMiddleware,
  type ActivityActionsDecoratorMiddlewareInit,
  type ActivityActionsDecoratorMiddlewareProps,
  type ActivityActionsDecoratorMiddlewareRequest
};
