import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { createErrorBoxPolymiddleware, errorBoxComponent } from 'botframework-webchat-api/middleware';
import { Components } from 'botframework-webchat-component';
import React, { memo, useMemo } from 'react';
import { object, optional, pipe, string, type InferInput } from 'valibot';
import ErrorBox, { type ErrorBoxProps } from './private/ErrorBox';

const { ThemeProvider } = Components;

const debugProviderPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    nonce: optional(string())
  })
);

type DebugProviderProps = InferInput<typeof debugProviderPropsSchema>;

function DebugProvider(props: DebugProviderProps) {
  const { children, nonce } = validateProps(debugProviderPropsSchema, props);

  const polymiddleware = useMemo(
    () =>
      Object.freeze([
        createErrorBoxPolymiddleware(
          () => request =>
            errorBoxComponent<ErrorBoxProps & { readonly children?: never }>(ErrorBox, {
              error: request.error,
              type: request.where
            })
        )
      ]),
    []
  );

  return (
    <ThemeProvider nonce={nonce} polymiddleware={polymiddleware}>
      {children}
    </ThemeProvider>
  );
}

export default memo(DebugProvider);
export { debugProviderPropsSchema, type DebugProviderProps };
