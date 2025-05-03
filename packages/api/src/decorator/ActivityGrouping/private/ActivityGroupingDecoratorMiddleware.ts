import templateMiddleware from '../../private/templateMiddleware';
import {
  type ActivityGroupingDecoratorProps,
  type ActivityGroupingDecoratorRequest,
  type activityGroupingDecoratorTypeName
} from '../types';

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

export {
  ActivityGroupingDecoratorMiddlewareProvider,
  ActivityGroupingDecoratorMiddlewareProxy,
  initActivityGroupingDecoratorMiddleware,
  type ActivityGroupingDecoratorMiddleware,
  type ActivityGroupingDecoratorMiddlewareInit,
  type ActivityGroupingDecoratorMiddlewareProps,
  type ActivityGroupingDecoratorMiddlewareRequest
};
