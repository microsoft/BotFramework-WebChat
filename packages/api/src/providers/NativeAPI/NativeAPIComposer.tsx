import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { InternalNativeAPI } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { instance, object, optional, pipe, readonly, type InferOutput } from 'valibot';
import NativeAPIContext, { NativeAPIContextType } from './private/NativeAPIContext';

const nativeAPIComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    internalNativeAPI: instance(InternalNativeAPI)
  }),
  readonly()
);

type NativeAPIComposerProps = InferOutput<typeof nativeAPIComposerPropsSchema>;

function NativeAPIComposer(props: NativeAPIComposerProps) {
  const { children, internalNativeAPI } = validateProps(nativeAPIComposerPropsSchema, props);

  const context = useMemo<NativeAPIContextType>(
    () =>
      Object.freeze({
        internalNativeAPIState: Object.freeze([internalNativeAPI] as const),
        nativeAPIState: Object.freeze([
          Object.freeze({
            breakpoint: internalNativeAPI.breakpoint,
            eventTarget: internalNativeAPI.eventTarget
          })
        ] as const)
      }),
    [internalNativeAPI]
  );

  return <NativeAPIContext.Provider value={context}>{children}</NativeAPIContext.Provider>;
}

NativeAPIComposer.displayName = 'NativeAPIComposer';

export default memo(NativeAPIComposer);
export { nativeAPIComposerPropsSchema, type NativeAPIComposerProps };
