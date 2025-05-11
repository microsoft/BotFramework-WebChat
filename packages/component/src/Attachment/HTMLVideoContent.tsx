import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleSet from '../hooks/useStyleSet';
import parseProps from '../Utils/parseProps';

const htmlVideoContentPropsSchema = pipe(
  object({
    alt: optional(string(), ''), // TODO: Should remove default value.
    autoPlay: optional(boolean(), false), // TODO: Should remove default value.
    loop: optional(boolean(), false), // TODO: Should remove default value.
    poster: optional(string(), ''), // TODO: Should remove default value.
    src: string()
  }),
  readonly()
);

type HTMLVideoContentProps = InferInput<typeof htmlVideoContentPropsSchema>;

function HTMLVideoContent(props: HTMLVideoContentProps) {
  const { alt, autoPlay, loop, poster, src } = parseProps(htmlVideoContentPropsSchema, props);

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
