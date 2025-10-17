import { forwardedRef, reactNode, refObject, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { forwardRef, memo, useMemo, type ForwardedRef, type ReactNode, type RefObject } from 'react';
import { function_, object, optional, picklist, pipe, readonly, string, type InferInput } from 'valibot';

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
  createMiddleware: createButtonPolymiddleware,
  extractEnhancer: extractButtonEnhancer,
  Provider,
  Proxy,
  reactComponent: buttonComponent,
  useBuildRenderCallback: useBuildRenderButtonCallback
} = templatePolymiddleware<
  {
    readonly appearance?: 'elevated' | 'flat' | undefined;
    readonly size?: 'hero' | 'normal' | undefined;
  },
  {
    readonly children?: ReactNode | undefined;
    readonly className?: string | undefined;
    readonly forwardedRef?: ForwardedRef<HTMLElement> | undefined;
    readonly onClick?: (() => void) | undefined;
    readonly popoverTargetAction?: 'hide' | 'show' | 'toggle' | undefined;
    readonly popoverTargetRef?: RefObject<Element> | undefined;
  }
>('Button');

type ButtonPolymiddleware = InferMiddleware<typeof Provider>;
type ButtonPolymiddlewareHandler = InferHandler<typeof Provider>;
type ButtonPolymiddlewareHandlerResult = InferHandlerResult<typeof Provider>;
type ButtonPolymiddlewareProps = InferProps<typeof Provider>;
type ButtonPolymiddlewareRenderer = InferRenderer<typeof Provider>;
type ButtonPolymiddlewareRequest = InferRequest<typeof Provider>;
type ButtonPolymiddlewareProviderProps = InferProviderProps<typeof Provider>;

const buttonPolymiddlewareProxyPropsSchema = pipe(
  object({
    appearance: optional(picklist(['elevated', 'flat'])),
    children: optional(reactNode()),
    className: optional(string()),
    forwardedRef: optional(forwardedRef<HTMLElement>()),
    onClick: optional(function_()),
    popoverTargetAction: optional(picklist(['hide', 'show', 'toggle'])),
    popoverTargetRef: optional(refObject<Element>()),
    size: optional(picklist(['hero', 'normal']))
  }),
  readonly()
);

type ButtonPolymiddlewareProxyProps = Readonly<InferInput<typeof buttonPolymiddlewareProxyPropsSchema>>;

// A friendlier version than the organic <Proxy>.
const ButtonPolymiddlewareProxy = memo(
  forwardRef(function ButtonPolymiddlewareProxy(props: ButtonPolymiddlewareProxyProps, ref: ForwardedRef<HTMLElement>) {
    const { appearance, children, className, onClick, popoverTargetAction, popoverTargetRef, size } = validateProps(
      buttonPolymiddlewareProxyPropsSchema,
      props
    );

    const request = useMemo(() => Object.freeze({ appearance, size }), [appearance, size]);

    return (
      <Proxy
        className={className}
        forwardedRef={ref}
        onClick={onClick}
        popoverTargetAction={popoverTargetAction}
        popoverTargetRef={popoverTargetRef}
        request={request}
      >
        {children}
      </Proxy>
    );
  })
);

const ButtonPolymiddlewareProvider = memo(function ButtonPolymiddlewareProvider({
  children,
  middleware
}: ButtonPolymiddlewareProviderProps) {
  // Decorates middleware with <ErrorBoundary>.
  const middlewareWithErrorBoundary = useMemo(
    () =>
      Object.freeze([
        // TODO: [P1] Should we simplify this middleware signature and allow error boundary middleware to run on every type of middleware?
        //            (init: any) => next => (request: undefined) => reactComponentForAll()
        //            We can't do it today because we have sanity check that prevent `reactComponent()` from different middleware cross-polluting each other.
        createErrorBoundaryMiddleware({
          createMiddleware: createButtonPolymiddleware,
          reactComponent: buttonComponent,
          where: 'Button polymiddleware'
        }),
        ...middleware
      ]),
    [middleware]
  );

  return <Provider middleware={middlewareWithErrorBoundary}>{children}</Provider>;
});

export {
  buttonComponent,
  ButtonPolymiddlewareProvider,
  ButtonPolymiddlewareProxy,
  createButtonPolymiddleware,
  extractButtonEnhancer,
  useBuildRenderButtonCallback,
  type ButtonPolymiddleware,
  type ButtonPolymiddlewareHandler,
  type ButtonPolymiddlewareHandlerResult,
  type ButtonPolymiddlewareProps,
  type ButtonPolymiddlewareProviderProps,
  type ButtonPolymiddlewareProxyProps,
  type ButtonPolymiddlewareRenderer,
  type ButtonPolymiddlewareRequest
};
