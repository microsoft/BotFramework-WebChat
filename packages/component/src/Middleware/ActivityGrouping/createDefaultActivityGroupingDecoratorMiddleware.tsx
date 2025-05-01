import { type ActivityGroupingDecoratorMiddleware } from 'botframework-webchat-api/decorator';
import RenderActivityGrouping from './ui/RenderActivityGrouping';
import SenderGrouping from './ui/SenderGrouping/SenderGrouping';
import StatusGrouping from './ui/StatusGrouping/StatusGrouping';

export default function createDefaultActivityGroupingDecoratorMiddleware(): readonly ActivityGroupingDecoratorMiddleware[] {
  return Object.freeze([
    () =>
      () =>
      ({ type }) =>
        type === 'sender' ? SenderGrouping : type === 'status' ? StatusGrouping : RenderActivityGrouping
  ]);
}
