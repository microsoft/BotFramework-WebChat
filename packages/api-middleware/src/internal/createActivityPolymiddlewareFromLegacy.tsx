import { type WebChatActivity } from 'botframework-webchat-core';
import { composeEnhancer } from 'handler-chain';
import { type ComponentType, type ReactNode } from 'react';
import {
  boolean,
  custom,
  function_,
  literal,
  never,
  object,
  optional,
  pipe,
  readonly,
  safeParse,
  union,
  type InferInput
} from 'valibot';

import {
  activityComponent,
  createActivityPolymiddleware,
  type ActivityPolymiddleware
} from '../activityPolymiddleware';
import { type LegacyActivityMiddleware } from '../legacy/activityMiddleware';
import { type LegacyRenderAttachment } from '../legacy/attachmentMiddleware';

const webChatActivitySchema = custom<WebChatActivity>(value => safeParse(object({}), value).success);

type LegacyRenderFunction = (
  renderAttachment: LegacyRenderAttachment,
  options: {
    readonly hideTimestamp: boolean;
    readonly renderActivityStatus: (options: { hideTimestamp: boolean }) => ReactNode;
    readonly renderAvatar: false | (() => Exclude<ReactNode, boolean | null | undefined>);
    readonly showCallout: boolean;
  }
) => Exclude<ReactNode, boolean>;

const legacyActivityBridgeComponentPropsSchema = pipe(
  object({
    activity: webChatActivitySchema,
    children: optional(never()),
    render: custom<LegacyRenderFunction>(value => safeParse(function_(), value).success),

    // The following extraneous props should be removed once `useCreateActivityRenderer()` is removed.
    hideTimestamp: optional(boolean()),
    renderActivityStatus: optional(
      custom<(options: { hideTimestamp: boolean }) => ReactNode>(value => safeParse(function_(), value).success)
    ),
    renderAvatar: optional(
      union([
        literal(false),
        custom<() => Exclude<ReactNode, boolean | null | undefined>>(value => safeParse(function_(), value).success)
      ])
    ),
    showCallout: optional(boolean())
  }),
  readonly()
);

type LegacyActivityBridgeComponentProps = Readonly<
  InferInput<typeof legacyActivityBridgeComponentPropsSchema> & { children?: never }
>;

const fallbackComponentPropsSchema = pipe(
  object({
    activity: webChatActivitySchema,
    children: optional(never())
  }),
  readonly()
);

type FallbackComponentProps = Readonly<InferInput<typeof fallbackComponentPropsSchema> & { children?: never }>;
interface RenderFallbackComponentCallback {
  // Returns { render(): ReactNode } so we don't confuse with function component.
  (request: { activity: WebChatActivity }): { readonly render: () => ReactNode };
}

function createActivityPolymiddlewareFromLegacy(
  bridgeComponent: ComponentType<LegacyActivityBridgeComponentProps>,
  // Use lowercase for argument name, but we need uppercase for JSX.
  renderFallbackComponent: RenderFallbackComponentCallback,
  ...middleware: readonly LegacyActivityMiddleware[]
): ActivityPolymiddleware;

function createActivityPolymiddlewareFromLegacy(
  bridgeComponent: ComponentType<LegacyActivityBridgeComponentProps>,
  renderFallbackComponent: RenderFallbackComponentCallback,
  ...middleware: readonly LegacyActivityMiddleware[]
): ActivityPolymiddleware {
  const legacyEnhancer = composeEnhancer(...middleware.map(middleware => middleware()));

  return createActivityPolymiddleware(() => {
    const legacyHandler = legacyEnhancer(
      request => () => renderFallbackComponent({ activity: request.activity })?.render()
    );

    return ({ activity }) => {
      // TODO: [P1] `nextVisibleActivity` is deprecated and should be removed.
      const legacyResult = legacyHandler({ activity, nextVisibleActivity: undefined as any });

      if (!legacyResult) {
        // Legacy cannot fallback to poly middleware due to signature incompatibility.
        return undefined;
      }

      return activityComponent(bridgeComponent, { activity, render: legacyResult });
    };
  });
}

export default createActivityPolymiddlewareFromLegacy;

export {
  fallbackComponentPropsSchema,
  legacyActivityBridgeComponentPropsSchema,
  type FallbackComponentProps,
  type LegacyActivityBridgeComponentProps
};
