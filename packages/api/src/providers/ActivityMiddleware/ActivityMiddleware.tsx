import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { OneOrMany, singleToArray } from 'botframework-webchat-core';
// TODO: fix the import location
import createChainOfResponsibility from '../../hooks/internal/react-chain-of-responsibility/packages/react-chain-of-responsibility/src/createChainOfResponsibility';
import ActivityMiddleware, {
  ActivityComponentFactory,
  ActivityComponentFactoryOptions,
  ActivityProps
} from '../../types/ActivityMiddleware';
import { applyV2MiddlewareShim, middlewareTypeShim } from '../../utils/v2Middleware';
import useWebChatAPIContext from '../../hooks/internal/useWebChatAPIContext';

const { Provider: ActivityMiddlewareProviderInner, Proxy: ActivityMiddlewareProxy } = createChainOfResponsibility<
  ActivityComponentFactoryOptions,
  ActivityProps & ActivityComponentFactoryOptions
>();

type ActivityMiddlewareProviderProps = Readonly<{
  middleware: OneOrMany<ActivityMiddleware>;
  children?: ReactNode | undefined;
}>;

const ActivityMiddlewareProvider = ({ middleware, children }: ActivityMiddlewareProviderProps): ReactNode => {
  const { isUsingActivityMiddlewareV2 } = useWebChatAPIContext();
  return isUsingActivityMiddlewareV2 ? (
    <ActivityMiddlewareProviderInner
      middleware={applyV2MiddlewareShim(singleToArray(middleware), middlewareTypeShim.activity)}
    >
      {children}
    </ActivityMiddlewareProviderInner>
  ) : (
    <React.Fragment>{children}</React.Fragment>
  );
};

ActivityMiddlewareProvider.displayName = 'ActivityMiddlewareProvider';

ActivityMiddlewareProvider.defaultProps = {
  children: undefined,
  middleware: undefined
};

ActivityMiddlewareProvider.propTypes = {
  children: PropTypes.any,
  middleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func])
};

ActivityMiddlewareProxy.displayName = 'ActivityMiddlewareProxy';

const useCreateActivityRendererV2: ActivityComponentFactory = options =>
  function ActivityRendererV2(props) {
    return <ActivityMiddlewareProxy request={options} {...props} {...options} />;
  };

export { ActivityMiddlewareProvider, useCreateActivityRendererV2 };
