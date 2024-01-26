// TODO: fix the import location
import createChainOfResponsibility from '../../hooks/internal/react-chain-of-responsibility/packages/react-chain-of-responsibility/src/createChainOfResponsibility';
import { ActivityComponentFactoryOptions, ActivityProps } from '../../types/ActivityMiddleware';

const { Provider: ActivityMiddlewareProvider, Proxy: ActivityMiddlewareProxy } = createChainOfResponsibility<
  ActivityComponentFactoryOptions,
  ActivityProps & ActivityComponentFactoryOptions
>();

export { ActivityMiddlewareProvider, ActivityMiddlewareProxy };
