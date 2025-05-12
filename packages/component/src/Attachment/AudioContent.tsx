import { validateProps } from 'botframework-webchat-api/internal';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleSet from '../hooks/useStyleSet';

const audioContentPropsSchema = pipe(
  object({
    alt: optional(string(), ''), // TODO: Should remove default value.
    autoPlay: optional(boolean(), false), // TODO: Should remove default value.
    loop: optional(boolean(), false), // TODO: Should remove default value.
    poster: optional(string(), ''), // TODO: Should remove default value.
    src: string()
  }),
  readonly()
);

type AudioContentProps = InferInput<typeof audioContentPropsSchema>;

function AudioContent(props: AudioContentProps) {
  const { alt, autoPlay, loop, src } = validateProps(audioContentPropsSchema, props);
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
