import LowPriorityDecoratorComposer from './decorator/internal/LowPriorityDecoratorComposer';
import useSetDictateState from './hooks/internal/useSetDictateState';

export {
  createActivityPolyMiddlewareFromLegacy,
  legacyActivityBridgeComponentPropsSchema,
  type LegacyActivityBridgeComponentProps
} from '@msinternal/botframework-webchat-api-middleware/internal';

export { LegacyActivityContextProvider, type LegacyActivityContextType } from './legacy/LegacyActivityBridgeContext';

export { LowPriorityDecoratorComposer, useSetDictateState };
