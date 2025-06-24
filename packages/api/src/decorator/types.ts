import { type ActivityBorderDecoratorMiddleware } from './ActivityBorder/private/ActivityBorderDecoratorMiddleware';
import { activityBorderDecoratorTypeName } from './ActivityBorder/types';
import { type ActivityGroupingDecoratorMiddleware } from './ActivityGrouping/private/ActivityGroupingDecoratorMiddleware';
import { activityGroupingDecoratorTypeName } from './ActivityGrouping/types';

export type DecoratorMiddleware =
  | ((init: typeof activityBorderDecoratorTypeName) => ReturnType<ActivityBorderDecoratorMiddleware> | false)
  | ((init: typeof activityGroupingDecoratorTypeName) => ReturnType<ActivityGroupingDecoratorMiddleware> | false);

export function activityBorderMiddleware(
  enhancer: ReturnType<ActivityBorderDecoratorMiddleware>
): (init: string) => ReturnType<ActivityBorderDecoratorMiddleware> | false {
  return init => init === activityBorderDecoratorTypeName && enhancer;
}

export function activityGroupingMiddleware(
  enhancer: ReturnType<ActivityGroupingDecoratorMiddleware>
): (init: string) => ReturnType<ActivityGroupingDecoratorMiddleware> | false {
  return init => init === activityGroupingDecoratorTypeName && enhancer;
}
