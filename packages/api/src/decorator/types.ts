import { createActivityBorderMiddleware } from './ActivityBorder/private/ActivityBorderDecoratorMiddleware';
import { createActivityGroupingMiddleware } from './ActivityGrouping/private/ActivityGroupingDecoratorMiddleware';

export type DecoratorMiddleware =
  | ReturnType<typeof createActivityBorderMiddleware>
  | ReturnType<typeof createActivityGroupingMiddleware>;
