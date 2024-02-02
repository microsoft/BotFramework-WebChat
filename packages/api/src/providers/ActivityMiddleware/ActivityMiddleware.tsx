import React, { ReactNode, useMemo } from 'react';
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

const { Provider: ActivityMiddlewareProviderInner, useBuildComponentCallback } = createChainOfResponsibility<
  ActivityComponentFactoryOptions,
  ActivityProps & ActivityComponentFactoryOptions
>();

type ActivityMiddlewareProviderProps = Readonly<{
  middleware: OneOrMany<ActivityMiddleware>;
  children?: ReactNode | undefined;
}>;

const ActivityMiddlewareProvider = ({ middleware, children }: ActivityMiddlewareProviderProps): ReactNode => {
  const { isUsingActivityMiddlewareV2 } = useWebChatAPIContext();
  return (
    <ActivityMiddlewareProviderInner
      middleware={
        isUsingActivityMiddlewareV2 ? applyV2MiddlewareShim(singleToArray(middleware), middlewareTypeShim.activity) : []
      }
    >
      {children}
    </ActivityMiddlewareProviderInner>
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

function useCreateActivityRendererV2(): ActivityComponentFactory {
  const enhancer = useBuildComponentCallback();
  return useMemo(
    () => createActivityRendererOptions => {
      const Component = enhancer(createActivityRendererOptions);

      if (!Component) {
        return false;
      }

      return props => <Component {...props} {...createActivityRendererOptions} />;
    },
    [enhancer]
  );
}

export { ActivityMiddlewareProvider, useCreateActivityRendererV2 };
