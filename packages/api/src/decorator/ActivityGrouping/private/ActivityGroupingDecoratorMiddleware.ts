import { type WebChatActivity } from 'botframework-webchat-core';
import templateMiddleware from '../../private/templateMiddleware';
import { type activityGroupingDecoratorTypeName } from '../types';

type Request = Readonly<{
  /**
   * Name of the grouping from the result of `groupActivitesMiddleware()`.
   */
  groupingName: string;
}>;

type Props = Readonly<{
  activities: readonly WebChatActivity[];
}>;

const {
  initMiddleware: initActivityGroupingDecoratorMiddleware,
  Provider: ActivityGroupingDecoratorMiddlewareProvider,
  Proxy: ActivityGroupingDecoratorMiddlewareProxy,
  // False positive, `types` is used for its typing.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  types
} = templateMiddleware<typeof activityGroupingDecoratorTypeName, Request, Props>('ActivityGroupingDecoratorMiddleware');

type ActivityGroupingDecoratorMiddleware = typeof types.middleware;
type ActivityGroupingDecoratorMiddlewareInit = typeof types.init;
type ActivityGroupingDecoratorMiddlewareProps = typeof types.props;
type ActivityGroupingDecoratorMiddlewareRequest = typeof types.request;

export {
  ActivityGroupingDecoratorMiddlewareProvider,
  ActivityGroupingDecoratorMiddlewareProxy,
  initActivityGroupingDecoratorMiddleware,
  type ActivityGroupingDecoratorMiddleware,
  type ActivityGroupingDecoratorMiddlewareInit,
  type ActivityGroupingDecoratorMiddlewareProps,
  type ActivityGroupingDecoratorMiddlewareRequest
};
