import { type WebChatActivity } from 'botframework-webchat-core';
import templateMiddleware, {
  type InferMiddleware,
  type InferProps,
  type InferRequest
} from '../../../middleware/private/templateMiddleware';

type Request = Readonly<{
  /**
   * Name of the grouping from the result of `groupActivitesMiddleware()`.
   */
  groupingName: string;
}>;

type Props = Readonly<{
  activities: readonly WebChatActivity[];
}>;

const template = templateMiddleware<Request, Props>('activity grouping');

const {
  createMiddleware: createActivityGroupingMiddleware,
  extractMiddleware: extractActivityGroupingDecoratorMiddleware,
  Provider: ActivityGroupingDecoratorMiddlewareProvider,
  Proxy: ActivityGroupingDecoratorMiddlewareProxy
} = template;

type ActivityGroupingDecoratorMiddleware = InferMiddleware<typeof template>;
type ActivityGroupingDecoratorMiddlewareProps = InferProps<typeof template>;
type ActivityGroupingDecoratorMiddlewareRequest = InferRequest<typeof template>;

export {
  ActivityGroupingDecoratorMiddlewareProvider,
  ActivityGroupingDecoratorMiddlewareProxy,
  createActivityGroupingMiddleware,
  extractActivityGroupingDecoratorMiddleware,
  type ActivityGroupingDecoratorMiddleware,
  type ActivityGroupingDecoratorMiddlewareProps,
  type ActivityGroupingDecoratorMiddlewareRequest
};
