import { type WebChatActivity } from 'botframework-webchat-core';
import { composeEnhancer } from 'handler-chain';
import { type ReactNode } from 'react';
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
} from '../package-api-middleware/index';
import { type LegacyActivityMiddleware, type LegacyRenderAttachment } from '../package-api-middleware/legacy';
import LegacyActivityBridge from './LegacyActivityBridge';

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

/**
 * Polyfill legacy activity middleware into a polymiddleware.
 *
 * @deprecated Legacy activity middleware is being deprecated and will be removed on or after 2027-08-16.
 * @param middleware An array of legacy activity middleware.
 * @returns A polymiddleware composed by legacy activity middleware.
 */
function createActivityPolymiddlewareFromLegacy(
  ...middleware: readonly LegacyActivityMiddleware[]
): ActivityPolymiddleware {
  const legacyEnhancer = composeEnhancer(...middleware.map(middleware => middleware()));

  return createActivityPolymiddleware(next => {
    const legacyHandler = legacyEnhancer(request => {
      const handler = next(request);

      return !!handler && (() => handler.render({}));
    });

    return request => {
      const legacyResult = legacyHandler(request);

      return legacyResult
        ? activityComponent(LegacyActivityBridge, { activity: request.activity, render: legacyResult })
        : undefined;
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
