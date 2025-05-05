import { type ActivityBorderDecoratorMiddleware } from './ActivityBorder/private/ActivityBorderDecoratorMiddleware';
import { type activityBorderDecoratorTypeName } from './ActivityBorder/types';
import { type ActivityGroupingDecoratorMiddleware } from './ActivityGrouping/private/ActivityGroupingDecoratorMiddleware';
import { type activityGroupingDecoratorTypeName } from './ActivityGrouping/types';

export type DecoratorMiddlewareTypes = {
  [activityBorderDecoratorTypeName]: ReturnType<ActivityBorderDecoratorMiddleware>;
  [activityGroupingDecoratorTypeName]: ReturnType<ActivityGroupingDecoratorMiddleware>;
};

export type DecoratorMiddlewareInit = keyof DecoratorMiddlewareTypes;

export interface DecoratorMiddleware {
  (init: keyof DecoratorMiddlewareTypes): DecoratorMiddlewareTypes[typeof init] | false;
}
