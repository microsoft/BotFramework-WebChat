import { type WebChatActivity } from 'botframework-webchat-core';
import templateMiddleware from './templateMiddleware';

type ActivityGroupingDecoratorProps = {
  activities: readonly WebChatActivity[];
};

type ActivityGroupingDecoratorRequest = {
  type: string;
};

const {
  initMiddleware: initActivityGroupingDecoratorMiddleware,
  Provider: ActivityGroupingDecoratorMiddlewareProvider,
  Proxy: ActivityGroupingDecoratorMiddlewareProxy,
  // False positive, `types` is used for its typing.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  types
} = templateMiddleware<
  typeof activityGroupingDecoratorTypeName,
  ActivityGroupingDecoratorRequest,
  ActivityGroupingDecoratorProps
>('ActivityGroupingDecoratorMiddleware');

type ActivityGroupingDecoratorMiddleware = typeof types.middleware;
type ActivityGroupingDecoratorMiddlewareInit = typeof types.init;
type ActivityGroupingDecoratorMiddlewareProps = typeof types.props;
type ActivityGroupingDecoratorMiddlewareRequest = typeof types.request;

const activityGroupingDecoratorTypeName = 'activity grouping' as const;

export {
  ActivityGroupingDecoratorMiddlewareProvider,
  ActivityGroupingDecoratorMiddlewareProxy,
  activityGroupingDecoratorTypeName,
  initActivityGroupingDecoratorMiddleware,
  type ActivityGroupingDecoratorMiddleware,
  type ActivityGroupingDecoratorMiddlewareInit,
  type ActivityGroupingDecoratorMiddlewareProps,
  type ActivityGroupingDecoratorMiddlewareRequest
};
