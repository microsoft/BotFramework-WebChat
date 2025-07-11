import { ActivityBorderDecoratorMiddleware } from './ActivityBorder/private/ActivityBorderDecoratorMiddleware';
import { ActivityGroupingDecoratorMiddleware } from './ActivityGrouping/private/ActivityGroupingDecoratorMiddleware';

export type DecoratorMiddleware = ActivityBorderDecoratorMiddleware | ActivityGroupingDecoratorMiddleware;
