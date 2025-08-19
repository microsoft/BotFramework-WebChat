import { createActivityGroupingMiddleware, type DecoratorMiddleware } from 'botframework-webchat-api/decorator';
import RenderActivityGrouping from './ui/RenderActivityGrouping';
import SenderGrouping from './ui/SenderGrouping/SenderGrouping';
import StatusGrouping from './ui/StatusGrouping/StatusGrouping';
import PartGrouping from './ui/PartGrouping/PartGrouping';

export default function createDefaultActivityGroupingDecoratorMiddleware(): readonly DecoratorMiddleware[] {
  return Object.freeze([
    createActivityGroupingMiddleware(
      () =>
        ({ groupingName }) =>
          groupingName === 'sender'
            ? SenderGrouping
            : groupingName === 'status'
              ? StatusGrouping
              : groupingName === 'part'
                ? PartGrouping
                : RenderActivityGrouping
    )
  ]);
}
