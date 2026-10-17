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

  const hostname = url?.hostname;
  const lastSegment = url?.pathname.split('/').pop();

  // Embed YouTube and Vimeo videos only when the URL has a video ID, otherwise, play the URL in <video>.
  const vimeoEmbedID = (hostname === VIMEO_DOMAIN || hostname === VIMEO_WWW_DOMAIN) && lastSegment;
  const youTubeEmbedID =
    hostname === YOUTUBE_DOMAIN || hostname === YOUTUBE_WWW_DOMAIN
      ? url.searchParams.get('v')
      : (hostname === YOUTUBE_SHORT_DOMAIN || hostname === YOUTUBE_WWW_SHORT_DOMAIN) && lastSegment;

  return vimeoEmbedID ? (
    <VimeoContent alt={alt} autoPlay={autoPlay} embedID={vimeoEmbedID} loop={loop} />
  ) : youTubeEmbedID ? (
    <YouTubeContent alt={alt} autoPlay={autoPlay} embedID={youTubeEmbedID} loop={loop} />
  ) : (
    <HTMLVideoContent alt={alt} autoPlay={autoPlay} loop={loop} poster={poster} src={src} />
  );
}

export default memo(VideoContent);
export { videoContentPropsSchema, type VideoContentProps };
