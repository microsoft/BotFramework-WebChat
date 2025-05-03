import templateMiddleware from '../../private/templateMiddleware';
import {
  type ActivityBorderDecoratorProps,
  type ActivityBorderDecoratorRequest,
  type activityBorderDecoratorTypeName
} from '../types';

const {
  initMiddleware: initActivityBorderDecoratorMiddleware,
  Provider: ActivityBorderDecoratorMiddlewareProvider,
  Proxy: ActivityBorderDecoratorMiddlewareProxy,
  // False positive, `types` is used for its typing.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  types
} = templateMiddleware<
  typeof activityBorderDecoratorTypeName,
  ActivityBorderDecoratorRequest,
  ActivityBorderDecoratorProps
>('ActivityBorderDecoratorMiddleware');

type ActivityBorderDecoratorMiddleware = typeof types.middleware;
type ActivityBorderDecoratorMiddlewareInit = typeof types.init;
type ActivityBorderDecoratorMiddlewareProps = typeof types.props;
type ActivityBorderDecoratorMiddlewareRequest = typeof types.request;

export {
  ActivityBorderDecoratorMiddlewareProvider,
  ActivityBorderDecoratorMiddlewareProxy,
  initActivityBorderDecoratorMiddleware,
  type ActivityBorderDecoratorMiddleware,
  type ActivityBorderDecoratorMiddlewareInit,
  type ActivityBorderDecoratorMiddlewareProps,
  type ActivityBorderDecoratorMiddlewareRequest
};
