import {
  type DecoratorMiddleware,
  type DecoratorMiddlewareInit,
  type DecoratorMiddlewareTypes
} from 'botframework-webchat-api/decorator';
import RenderActivityGrouping from './ui/RenderActivityGrouping';
import SenderGrouping from './ui/SenderGrouping/SenderGrouping';
import StatusGrouping from './ui/StatusGrouping/StatusGrouping';

export default function createDefaultActivityGroupingDecoratorMiddleware(): readonly DecoratorMiddleware[] {
  return Object.freeze([
    (init: DecoratorMiddlewareInit) =>
      init === 'activity grouping' &&
      ((() =>
        ({ groupingName }) =>
          groupingName === 'sender'
            ? SenderGrouping
            : groupingName === 'status'
              ? StatusGrouping
              : RenderActivityGrouping) satisfies DecoratorMiddlewareTypes['activity grouping'])
  ]);
}
