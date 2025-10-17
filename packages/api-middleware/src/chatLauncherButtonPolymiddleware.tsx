import { refObject, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useMemo, type RefObject } from 'react';
import { type EmptyObject } from 'type-fest';
import { boolean, object, pipe, readonly, type InferInput } from 'valibot';

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
  createMiddleware: createChatLauncherButtonPolymiddleware,
  extractEnhancer: extractChatLauncherButtonEnhancer,
  Provider,
  Proxy,
  reactComponent: chatLauncherButtonComponent,
  useBuildRenderCallback: useBuildRenderChatLauncherButtonCallback
} = templatePolymiddleware<
  EmptyObject,
  {
    readonly children?: never;
    readonly hasMessage: boolean;
    readonly popoverTargetRef: RefObject<Element>;
  }
>('ChatLauncherButton');

type ChatLauncherButtonPolymiddleware = InferMiddleware<typeof Provider>;
type ChatLauncherButtonPolymiddlewareHandler = InferHandler<typeof Provider>;
type ChatLauncherButtonPolymiddlewareHandlerResult = InferHandlerResult<typeof Provider>;
type ChatLauncherButtonPolymiddlewareProps = InferProps<typeof Provider>;
type ChatLauncherButtonPolymiddlewareRenderer = InferRenderer<typeof Provider>;
type ChatLauncherButtonPolymiddlewareRequest = InferRequest<typeof Provider>;
type ChatLauncherButtonPolymiddlewareProviderProps = InferProviderProps<typeof Provider>;

const chatLauncherButtonPolymiddlewareProxyPropsSchema = pipe(
  object({
    hasMessage: boolean(),
    popoverTargetRef: refObject<Element>()
  }),
  readonly()
);

type ChatLauncherButtonPolymiddlewareProxyProps = Readonly<
  InferInput<typeof chatLauncherButtonPolymiddlewareProxyPropsSchema>
>;

const EMPTY_OBJECT = Object.freeze({});

// A friendlier version than the organic <Proxy>.
const ChatLauncherButtonPolymiddlewareProxy = memo(function ChatLauncherButtonPolymiddlewareProxy(
  props: ChatLauncherButtonPolymiddlewareProxyProps
) {
  const { hasMessage, popoverTargetRef } = validateProps(chatLauncherButtonPolymiddlewareProxyPropsSchema, props);

  return <Proxy hasMessage={hasMessage} popoverTargetRef={popoverTargetRef} request={EMPTY_OBJECT} />;
});

const ChatLauncherButtonPolymiddlewareProvider = memo(function ChatLauncherButtonPolymiddlewareProvider({
  children,
  middleware
}: ChatLauncherButtonPolymiddlewareProviderProps) {
  // Decorates middleware with <ErrorBoundary>.
  const middlewareWithErrorBoundary = useMemo(
    () =>
      Object.freeze([
        // TODO: [P1] Should we simplify this middleware signature and allow error boundary middleware to run on every type of middleware?
        //            (init: any) => next => (request: undefined) => reactComponentForAll()
        //            We can't do it today because we have sanity check that prevent `reactComponent()` from different middleware cross-polluting each other.
        createErrorBoundaryMiddleware({
          createMiddleware: createChatLauncherButtonPolymiddleware,
          reactComponent: chatLauncherButtonComponent,
          where: 'Chat launcher polymiddleware'
        }),
        ...middleware
      ]),
    [middleware]
  );

  return <Provider middleware={middlewareWithErrorBoundary}>{children}</Provider>;
});

export {
  chatLauncherButtonComponent,
  ChatLauncherButtonPolymiddlewareProvider,
  ChatLauncherButtonPolymiddlewareProxy,
  createChatLauncherButtonPolymiddleware,
  extractChatLauncherButtonEnhancer,
  useBuildRenderChatLauncherButtonCallback,
  type ChatLauncherButtonPolymiddleware,
  type ChatLauncherButtonPolymiddlewareHandler,
  type ChatLauncherButtonPolymiddlewareHandlerResult,
  type ChatLauncherButtonPolymiddlewareProps,
  type ChatLauncherButtonPolymiddlewareProviderProps,
  type ChatLauncherButtonPolymiddlewareProxyProps,
  type ChatLauncherButtonPolymiddlewareRenderer,
  type ChatLauncherButtonPolymiddlewareRequest
};
