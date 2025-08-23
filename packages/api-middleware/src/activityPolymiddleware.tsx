import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { custom, object, pipe, readonly, safeParse, type InferInput } from 'valibot';

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
  Provider: ActivityPolymiddlewareProvider,
  Proxy,
  reactComponent: activityComponent,
  useBuildRenderCallback: useBuildRenderActivityCallback
} = templatePolymiddleware<{ readonly activity: WebChatActivity }, { readonly children?: never }>('activity');

type ActivityPolymiddleware = InferMiddleware<typeof ActivityPolymiddlewareProvider>;
type ActivityPolymiddlewareHandler = InferHandler<typeof ActivityPolymiddlewareProvider>;
type ActivityPolymiddlewareHandlerResult = InferHandlerResult<typeof ActivityPolymiddlewareProvider>;
type ActivityPolymiddlewareProps = InferProps<typeof ActivityPolymiddlewareProvider>;
type ActivityPolymiddlewareRenderer = InferRenderer<typeof ActivityPolymiddlewareProvider>;
type ActivityPolymiddlewareRequest = InferRequest<typeof ActivityPolymiddlewareProvider>;
type ActivityPolymiddlewareProviderProps = InferProviderProps<typeof ActivityPolymiddlewareProvider>;

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
