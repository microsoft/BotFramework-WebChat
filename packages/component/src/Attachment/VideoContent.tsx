import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { onErrorResumeNext } from 'botframework-webchat-core';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import HTMLVideoContent from './HTMLVideoContent';
import VimeoContent from './VimeoContent';
import YouTubeContent from './YouTubeContent';

const YOUTUBE_DOMAIN = 'youtube.com';
const YOUTUBE_WWW_DOMAIN = 'www.youtube.com';
const YOUTUBE_SHORT_DOMAIN = 'youtu.be';
const YOUTUBE_WWW_SHORT_DOMAIN = 'www.youtu.be';
const VIMEO_DOMAIN = 'vimeo.com';
const VIMEO_WWW_DOMAIN = 'www.vimeo.com';

const videoContentPropsSchema = pipe(
  object({
    alt: optional(string()),
    autoPlay: optional(boolean()),
    loop: optional(boolean()),
    poster: optional(string()),
    src: string()
  }),
  readonly()
);

type VideoContentProps = InferInput<typeof videoContentPropsSchema>;

function VideoContent(props: VideoContentProps) {
  const { alt, autoPlay = false, loop = false, poster, src } = validateProps(videoContentPropsSchema, props);

  // Resolve relative URLs like <video src> does. If the URL cannot be parsed, leave it to <video>.
  const url = onErrorResumeNext(() => new URL(src, document.baseURI));
  const lastSegment = url?.pathname.split('/').pop();

  switch (url?.hostname) {
    case VIMEO_DOMAIN:
    case VIMEO_WWW_DOMAIN:
      return <VimeoContent alt={alt} autoPlay={autoPlay} embedID={lastSegment} loop={loop} />;

    case YOUTUBE_DOMAIN:
    case YOUTUBE_WWW_DOMAIN:
      return <YouTubeContent alt={alt} autoPlay={autoPlay} embedID={url.searchParams.get('v')} loop={loop} />;

    case YOUTUBE_SHORT_DOMAIN:
    case YOUTUBE_WWW_SHORT_DOMAIN:
      return <YouTubeContent alt={alt} autoPlay={autoPlay} embedID={lastSegment} loop={loop} />;

    default:
      return <HTMLVideoContent alt={alt} autoPlay={autoPlay} loop={loop} poster={poster} src={src} />;
  }
}

export default memo(VideoContent);
export { videoContentPropsSchema, type VideoContentProps };
