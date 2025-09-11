import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { custom, object, pipe, readonly, safeParse, type InferInput } from 'valibot';

import createErrorBoundaryMiddleware from './private/createErrorBoundaryMiddleware';
import templatePolymiddleware, {
  type InferHandler,
  type InferHandlerResult,
  type InferMiddleware,
  type InferProps,
  type InferProviderProps,
  type InferRenderer,
  type InferRequest
} from './private/templatePolymiddleware';

const {
  createMiddleware: createActivityPolymiddleware,
  extractEnhancer: extractActivityEnhancer,
  Provider,
  Proxy,
  reactComponent: activityComponent,
  useBuildRenderCallback: useBuildRenderActivityCallback
} = templatePolymiddleware<{ readonly activity: WebChatActivity }, { readonly children?: never }>('activity');

type ActivityPolymiddleware = InferMiddleware<typeof Provider>;
type ActivityPolymiddlewareHandler = InferHandler<typeof Provider>;
type ActivityPolymiddlewareHandlerResult = InferHandlerResult<typeof Provider>;
type ActivityPolymiddlewareProps = InferProps<typeof Provider>;
type ActivityPolymiddlewareRenderer = InferRenderer<typeof Provider>;
type ActivityPolymiddlewareRequest = InferRequest<typeof Provider>;
type ActivityPolymiddlewareProviderProps = InferProviderProps<typeof Provider>;

const activityPolymiddlewareProxyPropsSchema = pipe(
  object({
    activity: custom<Readonly<WebChatActivity>>(value => safeParse(object({}), value).success)
  }),
  readonly()
);

type ActivityPolymiddlewareProxyProps = Readonly<InferInput<typeof activityPolymiddlewareProxyPropsSchema>>;

// A friendlier version than the organic <Proxy>.
const ActivityPolymiddlewareProxy = memo(function ActivityPolymiddlewareProxy(props: ActivityPolymiddlewareProxyProps) {
  const { activity } = validateProps(activityPolymiddlewareProxyPropsSchema, props);

  const request = useMemo(() => ({ activity }), [activity]);

  return <Proxy request={request} />;
});

const ActivityPolymiddlewareProvider = memo(function ActivityPolymiddlewareProvider({
  children,
  middleware
}: ActivityPolymiddlewareProviderProps) {
  // Decorates middleware with <ErrorBoundary>.
  const middlewareWithErrorBoundary = useMemo(
    () =>
      Object.freeze([
        // TODO: [P1] Should we simplify this middleware signature and allow error boundary middleware to run on every type of middleware?
        //            (init: any) => next => (request: undefined) => reactComponentForAll()
        //            We can't do it today because we have sanity check that prevent `reactComponent()` from different middleware cross-polluting each other.
        createErrorBoundaryMiddleware({
          createMiddleware: createActivityPolymiddleware,
          reactComponent: activityComponent,
          where: 'Activity polymiddleware'
        }),
        ...middleware
      ]),
    [middleware]
  );

  return <Provider middleware={middlewareWithErrorBoundary}>{children}</Provider>;
});

export {
  activityComponent,
  ActivityPolymiddlewareProvider,
  ActivityPolymiddlewareProxy,
  createActivityPolymiddleware,
  extractActivityEnhancer,
  useBuildRenderActivityCallback,
  type ActivityPolymiddleware,
  type ActivityPolymiddlewareHandler,
  type ActivityPolymiddlewareHandlerResult,
  type ActivityPolymiddlewareProps,
  type ActivityPolymiddlewareProviderProps,
  type ActivityPolymiddlewareProxyProps,
  type ActivityPolymiddlewareRenderer,
  type ActivityPolymiddlewareRequest
};
