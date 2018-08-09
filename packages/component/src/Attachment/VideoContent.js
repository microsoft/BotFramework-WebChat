import React from 'react';

import HTMLVideoContent from './HTMLVideoContent';
import VimeoContent from './VimeoContent';
import YouTubeContent from './YouTubeContent';

const YOUTUBE_DOMAIN = "youtube.com";
const YOUTUBE_WWW_DOMAIN = "www.youtube.com";
const YOUTUBE_SHORT_DOMAIN = "youtu.be";
const YOUTUBE_WWW_SHORT_DOMAIN = "www.youtu.be";
const VIMEO_DOMAIN = "vimeo.com";
const VIMEO_WWW_DOMAIN = "www.vimeo.com";

export default props => {
  const { autoPlay, loop, poster, src } = props;
  const { hostname, pathname, search } = new URL(src);
  const lastSegment = pathname.split('/').pop();
  const searchParams = new URLSearchParams(search);

  switch (hostname) {
    case VIMEO_DOMAIN:
    case VIMEO_WWW_DOMAIN:
      return (
        <VimeoContent
          autoPlay={ autoPlay }
          embedID={ lastSegment }
          loop={ loop }
        />
      );

    case YOUTUBE_DOMAIN:
    case YOUTUBE_WWW_DOMAIN:
      return (
        <YouTubeContent
          autoPlay={ autoPlay }
          embedID={ searchParams.get('v') }
          loop={ loop }
        />
      );

    case YOUTUBE_SHORT_DOMAIN:
    case YOUTUBE_WWW_SHORT_DOMAIN:
      return (
        <YouTubeContent
          autoPlay={ autoPlay }
          embedID={ lastSegment }
          loop={ loop }
        />
      );

    default:
      return (
        <HTMLVideoContent
          autoPlay={ autoPlay }
          loop={ loop }
          poster={ poster }
          src={ src }
        />
      );
  }
}
