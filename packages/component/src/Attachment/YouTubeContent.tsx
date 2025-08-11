import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleSet from '../hooks/useStyleSet';

const { useLocalizer } = hooks;

const youTubeContentPropsSchema = pipe(
  object({
    alt: optional(string()),
    autoPlay: optional(boolean()),
    embedID: string(),
    loop: optional(boolean())
  }),
  readonly()
);

type YouTubeContentProps = InferInput<typeof youTubeContentPropsSchema>;

function YouTubeContent(props: YouTubeContentProps) {
  const { alt, autoPlay = false, embedID, loop = false } = validateProps(youTubeContentPropsSchema, props);

  const [{ youTubeContent: youTubeContentStyleSet }] = useStyleSet();
  const localize = useLocalizer();

  const search = new URLSearchParams({
    autoplay: autoPlay ? '1' : '0',
    loop: loop ? '1' : '0',
    modestbranding: '1'
  }).toString();
  const title = localize('ATTACHMENT_VIDEO');

  return (
    // TODO: We should encodeURI the URL
    <iframe
      allowFullScreen={true}
      aria-label={alt}
      className={youTubeContentStyleSet}
      sandbox="allow-same-origin allow-scripts"
      src={`https://youtube.com/embed/${embedID}?${search}`}
      title={title}
    />
  );
}

export default memo(YouTubeContent);
export { youTubeContentPropsSchema, type YouTubeContentProps };
