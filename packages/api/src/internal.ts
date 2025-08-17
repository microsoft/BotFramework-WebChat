import LowPriorityDecoratorComposer from './decorator/internal/LowPriorityDecoratorComposer';
import useSetDictateState from './hooks/internal/useSetDictateState';

export {
  createActivityPolyMiddlewareFromLegacy,
  legacyActivityBridgeComponentPropsSchema,
  type LegacyActivityBridgeComponentProps
} from '@msinternal/botframework-webchat-middleware/internal';

export { LowPriorityDecoratorComposer, useSetDictateState };
