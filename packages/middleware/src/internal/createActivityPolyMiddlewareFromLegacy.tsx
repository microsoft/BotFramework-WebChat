import { type ActivityMiddleware, type RenderAttachment } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import { composeEnhancer } from 'handler-chain';
import React, { type ComponentType, type ReactNode } from 'react';

import { custom, function_, never, object, optional, pipe, readonly, safeParse, type InferInput } from 'valibot';
import {
  activityComponent,
  createActivityPolyMiddleware,
  type ActivityPolyMiddleware
} from '../activityPolyMiddleware';

const webChatActivitySchema = custom<WebChatActivity>(value => safeParse(object({}), value).success);

type LegacyRenderFunction = (
  renderAttachment: RenderAttachment,
  options: {
    readonly hideTimestamp: boolean;
    readonly renderActivityStatus: (options: { hideTimestamp: boolean }) => ReactNode;
    readonly renderAvatar: false | (() => Exclude<ReactNode, boolean | null | undefined>);
    readonly showCallout: boolean;
  }
) => Exclude<ReactNode, boolean>;

const bridgeComponentPropsSchema = pipe(
  object({
    activity: webChatActivitySchema,
    children: optional(never()),
    render: custom<LegacyRenderFunction>(value => safeParse(function_(), value).success)
  }),
  readonly()
);

type BridgeComponentProps = Readonly<InferInput<typeof bridgeComponentPropsSchema> & { children?: never }>;

const fallbackComponentPropsSchema = pipe(
  object({
    activity: webChatActivitySchema,
    children: optional(never())
  }),
  readonly()
);

type FallbackComponentProps = Readonly<InferInput<typeof fallbackComponentPropsSchema> & { children?: never }>;

function createActivityPolyMiddlewareFromLegacy(
  bridgeComponent: ComponentType<BridgeComponentProps>,
  // Use lowercase for argument name, but we need uppercase for JSX.
  fallbackComponent: ComponentType<FallbackComponentProps>,
  ...middleware: readonly ActivityMiddleware[]
): ActivityPolyMiddleware;

function createActivityPolyMiddlewareFromLegacy(
  bridgeComponent: ComponentType<BridgeComponentProps>,
  FallbackComponent: ComponentType<FallbackComponentProps>,
  ...middleware: readonly ActivityMiddleware[]
): ActivityPolyMiddleware {
  const legacyEnhancer = composeEnhancer(...middleware.map(middleware => middleware()));

  return createActivityPolyMiddleware(() => {
    const legacyHandler = legacyEnhancer(request => () => <FallbackComponent activity={request.activity} />);

    return ({ activity }) => {
      // TODO: `nextVisibleActivity` is deprecated and should be removed.
      const legacyResult = legacyHandler({ activity, nextVisibleActivity: undefined as any });

      if (!legacyResult) {
        return undefined;
      }

      return activityComponent(bridgeComponent, { activity, render: legacyResult });
    };
  });
}

export default createActivityPolyMiddlewareFromLegacy;

export {
  bridgeComponentPropsSchema,
  fallbackComponentPropsSchema,
  type BridgeComponentProps,
  type FallbackComponentProps
};
