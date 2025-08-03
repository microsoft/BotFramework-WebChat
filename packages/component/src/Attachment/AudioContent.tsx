import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleSet from '../hooks/useStyleSet';

const audioContentPropsSchema = pipe(
  object({
    alt: optional(string()),
    autoPlay: optional(boolean()),
    loop: optional(boolean()),
    poster: optional(string()),
    src: string()
  }),
  readonly()
);

type AudioContentProps = InferInput<typeof audioContentPropsSchema>;

function AudioContent(props: AudioContentProps) {
  const { alt, autoPlay = false, loop = false, src } = validateProps(audioContentPropsSchema, props);
  const [{ audioContent: audioContentStyleSet }] = useStyleSet();

  return (
    <audio
      aria-label={alt}
      autoPlay={autoPlay}
      className={audioContentStyleSet}
      controls={true}
      loop={loop}
      src={src}
    />
  );
}

export default memo(AudioContent);
export { audioContentPropsSchema, type AudioContentProps };
