import { reactNode, validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import React, { memo, useMemo } from 'react';
import { Composer as ReactScrollToBottomComposer } from 'react-scroll-to-bottom';
import { args, function_, number, object, optional, pipe, readonly, returns, tuple } from 'valibot';

import useNonce from '../../hooks/internal/useNonce.js';

const { useStyleOptions } = hooks;

// Same shape as the `Scroller` type.
const scrollerSchema = pipe(
  function_(),
  args(tuple([object({ offsetHeight: number(), scrollHeight: number(), scrollTop: number() })])),
  returns(number())
);

const transcriptScrollComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    scroller: optional(scrollerSchema)
  }),
  readonly()
);

type TranscriptScrollComposerProps = InferReactProps<typeof transcriptScrollComposerPropsSchema>;

// Web Chat code should only talk to the transcript scroll engine through this folder, so the engine can be replaced in one place.
function TranscriptScrollComposer(props: TranscriptScrollComposerProps) {
  const { children, scroller } = validateProps(transcriptScrollComposerPropsSchema, props);

  const [{ stylesRoot }] = useStyleOptions();
  const [nonce] = useNonce();

  // react-scroll-to-bottom only uses `nonce` and `stylesRoot` for its own <style> element.
  const styleOptions = useMemo(() => Object.freeze({ stylesRoot }), [stylesRoot]);

  return (
    <ReactScrollToBottomComposer nonce={nonce} scroller={scroller} styleOptions={styleOptions}>
      {children}
    </ReactScrollToBottomComposer>
  );
}

TranscriptScrollComposer.displayName = 'TranscriptScrollComposer';

export default memo(TranscriptScrollComposer);
export { transcriptScrollComposerPropsSchema, type TranscriptScrollComposerProps };
