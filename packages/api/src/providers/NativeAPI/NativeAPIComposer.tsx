import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { NativeAPI } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { instance, object, optional, pipe, readonly, type InferOutput } from 'valibot';
import NativeAPIContext, { NativeAPIContextType } from './private/NativeAPIContext';

const nativeAPIComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    nativeAPI: instance(NativeAPI)
  }),
  readonly()
);

type NativeAPIComposerProps = InferOutput<typeof nativeAPIComposerPropsSchema>;

function NativeAPIComposer(props: NativeAPIComposerProps) {
  const { children, nativeAPI } = validateProps(nativeAPIComposerPropsSchema, props);

  const context = useMemo<NativeAPIContextType>(
    () => Object.freeze({ nativeAPIState: Object.freeze([nativeAPI] as const) }),
    [nativeAPI]
  );

  return <NativeAPIContext.Provider value={context}>{children}</NativeAPIContext.Provider>;
}

NativeAPIComposer.displayName = 'NativeAPIComposer';

export default memo(NativeAPIComposer);
export { nativeAPIComposerPropsSchema, type NativeAPIComposerProps };
