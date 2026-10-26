import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string } from 'valibot';

import styles from './AudioContent.module.css';

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

type AudioContentProps = InferReactProps<typeof audioContentPropsSchema>;

function AudioContent(props: AudioContentProps) {
  const { alt, autoPlay = false, loop = false, src } = validateProps(audioContentPropsSchema, props);

  const classNames = useStyles(styles);

  return (
    <audio
      aria-label={alt}
      autoPlay={autoPlay}
      className={classNames['audio-content']}
      controls={true}
      loop={loop}
      src={src}
    />
  );
}

export default memo(AudioContent);
export { audioContentPropsSchema, type AudioContentProps };
