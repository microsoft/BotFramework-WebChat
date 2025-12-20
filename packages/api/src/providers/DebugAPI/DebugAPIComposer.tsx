import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { type RootDebugAPI } from 'botframework-webchat-core/internal';
import React, { memo, useMemo } from 'react';
import { custom, object, optional, pipe, readonly, type InferOutput } from 'valibot';
import DebugAPIContext, { DebugAPIContextType } from './private/DebugAPIContext';

const debugAPIComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    rootDebugAPI: custom<RootDebugAPI>(value => value && typeof value === 'object')
  }),
  readonly()
);

type DebugAPIComposerProps = InferOutput<typeof debugAPIComposerPropsSchema>;

function DebugAPIComposer(props: DebugAPIComposerProps) {
  const { children, rootDebugAPI } = validateProps(debugAPIComposerPropsSchema, props);

  const context = useMemo<DebugAPIContextType>(
    () =>
      Object.freeze({
        rootDebugAPIState: Object.freeze([rootDebugAPI] as const)
      }),
    [rootDebugAPI]
  );

  return <DebugAPIContext.Provider value={context}>{children}</DebugAPIContext.Provider>;
}

DebugAPIComposer.displayName = 'DebugAPIComposer';

export default memo(DebugAPIComposer);
export { debugAPIComposerPropsSchema, type DebugAPIComposerProps };
