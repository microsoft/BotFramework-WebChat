import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useMemo, type ReactNode } from 'react';
import { type EmptyObject } from 'type-fest';
import { function_, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

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
  createMiddleware: createIconButtonPolymiddleware,
  extractEnhancer: extractIconButtonEnhancer,
  Provider,
  Proxy,
  reactComponent: iconButtonComponent,
  useBuildRenderCallback: useBuildRenderIconButtonCallback
} = templatePolymiddleware<
  EmptyObject,
  {
    readonly children?: ReactNode | undefined;
    readonly className?: string | undefined;
    readonly onClick?: (() => void) | undefined;
  }
>('IconButton');

type IconButtonPolymiddleware = InferMiddleware<typeof Provider>;
type IconButtonPolymiddlewareHandler = InferHandler<typeof Provider>;
type IconButtonPolymiddlewareHandlerResult = InferHandlerResult<typeof Provider>;
type IconButtonPolymiddlewareProps = InferProps<typeof Provider>;
type IconButtonPolymiddlewareRenderer = InferRenderer<typeof Provider>;
type IconButtonPolymiddlewareRequest = InferRequest<typeof Provider>;
type IconButtonPolymiddlewareProviderProps = InferProviderProps<typeof Provider>;

const iconButtonPolymiddlewareProxyPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    className: optional(string()),
    onClick: optional(function_())
  }),
  readonly()
);

type IconButtonPolymiddlewareProxyProps = Readonly<InferInput<typeof iconButtonPolymiddlewareProxyPropsSchema>>;

const EMPTY_OBJECT = Object.freeze({});

// A friendlier version than the organic <Proxy>.
const IconButtonPolymiddlewareProxy = memo(function IconButtonPolymiddlewareProxy(
  props: IconButtonPolymiddlewareProxyProps
) {
  const { children, className, onClick } = validateProps(iconButtonPolymiddlewareProxyPropsSchema, props);

  return (
    <Proxy className={className} onClick={onClick} request={EMPTY_OBJECT}>
      {children}
    </Proxy>
  );
});

const IconButtonPolymiddlewareProvider = memo(function IconButtonPolymiddlewareProvider({
  children,
  middleware
}: IconButtonPolymiddlewareProviderProps) {
  // Decorates middleware with <ErrorBoundary>.
  const middlewareWithErrorBoundary = useMemo(
    () =>
      Object.freeze([
        // TODO: [P1] Should we simplify this middleware signature and allow error boundary middleware to run on every type of middleware?
        //            (init: any) => next => (request: undefined) => reactComponentForAll()
        //            We can't do it today because we have sanity check that prevent `reactComponent()` from different middleware cross-polluting each other.
        createErrorBoundaryMiddleware({
          createMiddleware: createIconButtonPolymiddleware,
          reactComponent: iconButtonComponent,
          where: 'Icon button polymiddleware'
        }),
        ...middleware
      ]),
    [middleware]
  );

  return <Provider middleware={middlewareWithErrorBoundary}>{children}</Provider>;
});

export {
  createIconButtonPolymiddleware,
  extractIconButtonEnhancer,
  iconButtonComponent,
  IconButtonPolymiddlewareProvider,
  IconButtonPolymiddlewareProxy,
  useBuildRenderIconButtonCallback,
  type IconButtonPolymiddleware,
  type IconButtonPolymiddlewareHandler,
  type IconButtonPolymiddlewareHandlerResult,
  type IconButtonPolymiddlewareProps,
  type IconButtonPolymiddlewareProviderProps,
  type IconButtonPolymiddlewareProxyProps,
  type IconButtonPolymiddlewareRenderer,
  type IconButtonPolymiddlewareRequest
};
