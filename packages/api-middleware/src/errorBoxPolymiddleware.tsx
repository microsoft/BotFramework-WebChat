import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useCallback, useMemo } from 'react';
import { object, pipe, readonly, string, unknown, type InferInput } from 'valibot';

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
  createMiddleware: createErrorBoxPolymiddleware,
  extractEnhancer: extractErrorBoxEnhancer,
  Provider: ErrorBoxPolymiddlewareProvider,
  Proxy,
  reactComponent: errorBoxComponent,
  useBuildRenderCallback
} = templatePolymiddleware<{ readonly error: unknown; readonly where: string }, { readonly children?: never }>(
  'ErrorBox'
);

type ErrorBoxPolymiddleware = InferMiddleware<typeof ErrorBoxPolymiddlewareProvider>;
type ErrorBoxPolymiddlewareHandler = InferHandler<typeof ErrorBoxPolymiddlewareProvider>;
type ErrorBoxPolymiddlewareHandlerResult = InferHandlerResult<typeof ErrorBoxPolymiddlewareProvider>;
type ErrorBoxPolymiddlewareProps = InferProps<typeof ErrorBoxPolymiddlewareProvider>;
type ErrorBoxPolymiddlewareRenderer = InferRenderer<typeof ErrorBoxPolymiddlewareProvider>;
type ErrorBoxPolymiddlewareRequest = InferRequest<typeof ErrorBoxPolymiddlewareProvider>;
type ErrorBoxPolymiddlewareProviderProps = InferProviderProps<typeof ErrorBoxPolymiddlewareProvider>;

const ErrorBoxPolymiddlewareProxyPropsSchema = pipe(
  object({
    error: unknown(),
    where: string()
  }),
  readonly()
);

type ErrorBoxPolymiddlewareProxyProps = Readonly<InferInput<typeof ErrorBoxPolymiddlewareProxyPropsSchema>>;

// If no error box is defined, do not fallthrough into RCoR and it would error out. Render nothing instead.
const NullComponent = () => null;

// A friendlier version than the organic <Proxy>.
const ErrorBoxPolymiddlewareProxy = memo(function ErrorBoxPolymiddlewareProxy(props: ErrorBoxPolymiddlewareProxyProps) {
  const { error, where } = validateProps(ErrorBoxPolymiddlewareProxyPropsSchema, props);

  const request = useMemo(() => ({ error, where }), [error, where]);

  return <Proxy fallbackComponent={NullComponent} request={request} />;
});

const useBuildRenderErrorBoxCallback: typeof useBuildRenderCallback = () => {
  const buildRenderCallback = useBuildRenderCallback();

  return useCallback(
    (request, options) => buildRenderCallback(request, Object.freeze({ fallbackComponent: NullComponent, ...options })),
    [buildRenderCallback]
  );
};

export {
  createErrorBoxPolymiddleware,
  errorBoxComponent,
  ErrorBoxPolymiddlewareProvider,
  ErrorBoxPolymiddlewareProxy,
  extractErrorBoxEnhancer,
  useBuildRenderErrorBoxCallback,
  type ErrorBoxPolymiddleware,
  type ErrorBoxPolymiddlewareHandler,
  type ErrorBoxPolymiddlewareHandlerResult,
  type ErrorBoxPolymiddlewareProps,
  type ErrorBoxPolymiddlewareProviderProps,
  type ErrorBoxPolymiddlewareProxyProps,
  type ErrorBoxPolymiddlewareRenderer,
  type ErrorBoxPolymiddlewareRequest
};
