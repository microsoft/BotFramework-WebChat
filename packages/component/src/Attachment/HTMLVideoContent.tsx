import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string } from 'valibot';

import styles from './HTMLVideoContent.module.css';

const htmlVideoContentPropsSchema = pipe(
  object({
    alt: optional(string()),
    autoPlay: optional(boolean()),
    loop: optional(boolean()),
    poster: optional(string()),
    src: string()
  }),
  readonly()
);

type HTMLVideoContentProps = InferReactProps<typeof htmlVideoContentPropsSchema>;

function HTMLVideoContent(props: HTMLVideoContentProps) {
  const { alt, autoPlay = false, loop = false, poster, src } = validateProps(htmlVideoContentPropsSchema, props);

  const classNames = useStyles(styles);

  return (
    <video
      aria-label={alt}
      autoPlay={autoPlay}
      className={classNames['video-content']}
      controls={true}
      loop={loop}
      poster={poster}
      src={src}
    />
  );
}

export default memo(HTMLVideoContent);
export { htmlVideoContentPropsSchema, type HTMLVideoContentProps };
