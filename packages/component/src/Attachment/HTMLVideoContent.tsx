import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleSet from '../hooks/useStyleSet';

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

type HTMLVideoContentProps = InferInput<typeof htmlVideoContentPropsSchema>;

function HTMLVideoContent(props: HTMLVideoContentProps) {
  const { alt, autoPlay = false, loop = false, poster, src } = validateProps(htmlVideoContentPropsSchema, props);

  const [{ videoContent: videoContentStyleSet }] = useStyleSet();

  return (
    <video
      aria-label={alt}
      autoPlay={autoPlay}
      className={videoContentStyleSet}
      controls={true}
      loop={loop}
      poster={poster}
      src={src}
    />
  );
}

export default memo(HTMLVideoContent);
export { htmlVideoContentPropsSchema, type HTMLVideoContentProps };
