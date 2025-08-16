import LowPriorityDecoratorComposer from './decorator/internal/LowPriorityDecoratorComposer';
import useSetDictateState from './hooks/internal/useSetDictateState';

export {
  bridgeComponentPropsSchema,
  createActivityPolyMiddlewareFromLegacy,
  type BridgeComponentProps
} from '@msinternal/botframework-webchat-middleware';

export { LowPriorityDecoratorComposer, useSetDictateState };
