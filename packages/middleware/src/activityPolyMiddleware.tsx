import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { custom, object, pipe, readonly, safeParse, type InferInput } from 'valibot';

import templatePolyMiddleware, {
  type InferHandler,
  type InferHandlerResult,
  type InferMiddleware,
  type InferProps,
  type InferProviderProps,
  type InferRenderer,
  type InferRequest
} from './private/templatePolyMiddleware';

const {
  createMiddleware: createActivityPolyMiddleware,
  extractMiddleware: extractActivityPolyMiddleware,
  Provider: ActivityPolyMiddlewareProvider,
  Proxy,
  reactComponent: activityComponent,
  useBuildRenderCallback: useBuildRenderActivityCallback
} = templatePolyMiddleware<{ readonly activity: WebChatActivity }, { readonly children?: never }>('activity');

type ActivityPolyMiddleware = InferMiddleware<typeof ActivityPolyMiddlewareProvider>;
type ActivityPolyMiddlewareHandler = InferHandler<typeof ActivityPolyMiddlewareProvider>;
type ActivityPolyMiddlewareHandlerResult = InferHandlerResult<typeof ActivityPolyMiddlewareProvider>;
type ActivityPolyMiddlewareProps = InferProps<typeof ActivityPolyMiddlewareProvider>;
type ActivityPolyMiddlewareRenderer = InferRenderer<typeof ActivityPolyMiddlewareProvider>;
type ActivityPolyMiddlewareRequest = InferRequest<typeof ActivityPolyMiddlewareProvider>;
type ActivityPolyMiddlewareProviderProps = InferProviderProps<typeof ActivityPolyMiddlewareProvider>;

const activityPolyMiddlewareProxyPropsSchema = pipe(
  object({
    activity: custom<Readonly<WebChatActivity>>(value => safeParse(object({}), value).success)
  }),
  readonly()
);

type ActivityPolyMiddlewareProxyProps = Readonly<InferInput<typeof activityPolyMiddlewareProxyPropsSchema>>;

// A friendlier version than the organic <Proxy>.
const ActivityPolyMiddlewareProxy = memo(function ActivityPolyMiddlewareProxy(props: ActivityPolyMiddlewareProxyProps) {
  const { activity } = validateProps(activityPolyMiddlewareProxyPropsSchema, props);

  const request = useMemo(() => ({ activity }), [activity]);

  return <Proxy request={request} />;
});

export {
  activityComponent,
  ActivityPolyMiddlewareProvider,
  ActivityPolyMiddlewareProxy,
  createActivityPolyMiddleware,
  extractActivityPolyMiddleware,
  useBuildRenderActivityCallback,
  type ActivityPolyMiddleware,
  type ActivityPolyMiddlewareHandler,
  type ActivityPolyMiddlewareHandlerResult,
  type ActivityPolyMiddlewareProps,
  type ActivityPolyMiddlewareProviderProps,
  type ActivityPolyMiddlewareProxyProps,
  type ActivityPolyMiddlewareRenderer,
  type ActivityPolyMiddlewareRequest
};
