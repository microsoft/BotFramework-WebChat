import { forwardedRef, reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { forwardRef, memo, useMemo, type ForwardedRef, type ReactNode } from 'react';
import { literal, object, optional, picklist, pipe, readonly, string, type InferInput } from 'valibot';

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
  createMiddleware: createPopoverPolymiddleware,
  extractEnhancer: extractPopoverEnhancer,
  Provider,
  Proxy,
  reactComponent: popoverComponent,
  useBuildRenderCallback: useBuildRenderPopoverCallback
} = templatePolymiddleware<
  { readonly type: 'nonmodal' },
  {
    readonly children?: ReactNode | undefined;
    readonly className?: string | undefined;
    readonly forwardedRef?: ForwardedRef<Element> | undefined;
    readonly popover?: 'auto' | 'hint' | 'manual' | undefined;
  }
>('Popover');

type PopoverPolymiddleware = InferMiddleware<typeof Provider>;
type PopoverPolymiddlewareHandler = InferHandler<typeof Provider>;
type PopoverPolymiddlewareHandlerResult = InferHandlerResult<typeof Provider>;
type PopoverPolymiddlewareProps = InferProps<typeof Provider>;
type PopoverPolymiddlewareRenderer = InferRenderer<typeof Provider>;
type PopoverPolymiddlewareRequest = InferRequest<typeof Provider>;
type PopoverPolymiddlewareProviderProps = InferProviderProps<typeof Provider>;

const popoverPolymiddlewareProxyPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    className: optional(string()),
    forwardedRef: optional(forwardedRef<Element>()),
    popover: optional(picklist(['auto', 'hint', 'manual'])),
    type: literal('nonmodal')
  }),
  readonly()
);

type PopoverPolymiddlewareProxyProps = Readonly<InferInput<typeof popoverPolymiddlewareProxyPropsSchema>>;

// A friendlier version than the organic <Proxy>.
const PopoverPolymiddlewareProxy = memo(
  forwardRef(function PopoverPolymiddlewareProxy(props: PopoverPolymiddlewareProxyProps, ref: ForwardedRef<Element>) {
    const { children, className, popover, type } = validateProps(popoverPolymiddlewareProxyPropsSchema, props);

    const request = useMemo<PopoverPolymiddlewareRequest>(() => ({ type }), [type]);

    return (
      <Proxy className={className} forwardedRef={ref} popover={popover} request={request}>
        {children}
      </Proxy>
    );
  })
);

const PopoverPolymiddlewareProvider = memo(function PopoverPolymiddlewareProvider({
  children,
  middleware
}: PopoverPolymiddlewareProviderProps) {
  // Decorates middleware with <ErrorBoundary>.
  const middlewareWithErrorBoundary = useMemo(
    () =>
      Object.freeze([
        // TODO: [P1] Should we simplify this middleware signature and allow error boundary middleware to run on every type of middleware?
        //            (init: any) => next => (request: undefined) => reactComponentForAll()
        //            We can't do it today because we have sanity check that prevent `reactComponent()` from different middleware cross-polluting each other.
        createErrorBoundaryMiddleware({
          createMiddleware: createPopoverPolymiddleware,
          reactComponent: popoverComponent,
          where: 'Popover polymiddleware'
        }),
        ...middleware
      ]),
    [middleware]
  );

  return <Provider middleware={middlewareWithErrorBoundary}>{children}</Provider>;
});

export {
  createPopoverPolymiddleware,
  extractPopoverEnhancer,
  popoverComponent,
  PopoverPolymiddlewareProvider,
  PopoverPolymiddlewareProxy,
  useBuildRenderPopoverCallback,
  type PopoverPolymiddleware,
  type PopoverPolymiddlewareHandler,
  type PopoverPolymiddlewareHandlerResult,
  type PopoverPolymiddlewareProps,
  type PopoverPolymiddlewareProviderProps,
  type PopoverPolymiddlewareProxyProps,
  type PopoverPolymiddlewareRenderer,
  type PopoverPolymiddlewareRequest
};
