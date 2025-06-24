import { type WebChatActivity } from 'botframework-webchat-core';
import templateMiddleware, {
  type InferInit,
  type InferMiddleware,
  type InferProps,
  type InferRequest
} from '../../private/templateMiddleware';
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

const template = templateMiddleware<typeof activityGroupingDecoratorTypeName, Request, Props>(
  'ActivityGroupingDecoratorMiddleware'
);

const {
  initMiddleware: initActivityGroupingDecoratorMiddleware,
  Provider: ActivityGroupingDecoratorMiddlewareProvider,
  Proxy: ActivityGroupingDecoratorMiddlewareProxy,
  '~types': _types
} = template;

type ActivityGroupingDecoratorMiddleware = InferMiddleware<typeof template>;
type ActivityGroupingDecoratorMiddlewareInit = InferInit<typeof template>;
type ActivityGroupingDecoratorMiddlewareProps = InferProps<typeof template>;
type ActivityGroupingDecoratorMiddlewareRequest = InferRequest<typeof template>;

export {
  ActivityGroupingDecoratorMiddlewareProvider,
  ActivityGroupingDecoratorMiddlewareProxy,
  initActivityGroupingDecoratorMiddleware,
  type ActivityGroupingDecoratorMiddleware,
  type ActivityGroupingDecoratorMiddlewareInit,
  type ActivityGroupingDecoratorMiddlewareProps,
  type ActivityGroupingDecoratorMiddlewareRequest
};
