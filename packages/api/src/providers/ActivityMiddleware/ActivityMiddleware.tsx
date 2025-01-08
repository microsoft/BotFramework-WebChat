import React, { ReactNode, useMemo } from 'react';
import { OneOrMany, singleToArray } from 'botframework-webchat-core';
import { createChainOfResponsibility } from 'react-chain-of-responsibility';
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

const ActivityMiddlewareProvider = ({ middleware, children }: ActivityMiddlewareProviderProps) => {
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

function useCreateActivityRendererV2(): ActivityComponentFactory {
  const enhancer = useBuildComponentCallback();
  return useMemo(
    () => createActivityRendererOptions => {
      const Component = enhancer(createActivityRendererOptions);

      if (!Component) {
        return false;
      }

      return props => <Component {...createActivityRendererOptions} {...props} />;
    },
    [enhancer]
  );
}

export { ActivityMiddlewareProvider, useCreateActivityRendererV2 };
