import {
  type ActivityBorderDecoratorMiddleware,
  type activityBorderDecoratorTypeName
} from './ActivityBorderDecoratorMiddleware';
import {
  type ActivityGroupingDecoratorMiddleware,
  type activityGroupingDecoratorTypeName
} from './ActivityGroupingDecoratorMiddleware';

export type DecoratorMiddlewareTypes = {
  [activityBorderDecoratorTypeName]: ReturnType<ActivityBorderDecoratorMiddleware>;
  [activityGroupingDecoratorTypeName]: ReturnType<ActivityGroupingDecoratorMiddleware>;
};

export type DecoratorMiddlewareInit = keyof DecoratorMiddlewareTypes;

export interface DecoratorMiddleware {
  (init: keyof DecoratorMiddlewareTypes): DecoratorMiddlewareTypes[typeof init] | false;
}
