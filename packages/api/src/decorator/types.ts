import {
  type ActivityBorderDecoratorMiddleware,
  type activityBorderDecoratorTypeName
} from './private/ActivityBorderDecoratorMiddleware';
import {
  type ActivityGroupingDecoratorMiddleware,
  type activityGroupingDecoratorTypeName
} from './private/ActivityGroupingDecoratorMiddleware';

export type DecoratorMiddlewareTypes = {
  [activityBorderDecoratorTypeName]: ReturnType<ActivityBorderDecoratorMiddleware>;
  [activityGroupingDecoratorTypeName]: ReturnType<ActivityGroupingDecoratorMiddleware>;
};

export type DecoratorMiddlewareInit = keyof DecoratorMiddlewareTypes;

export interface DecoratorMiddleware {
  (init: keyof DecoratorMiddlewareTypes): DecoratorMiddlewareTypes[typeof init] | false;
}
