import PropTypes from 'prop-types';
import React, { FC } from 'react';

import useStyleSet from '../hooks/useStyleSet';

type YouTubeContentProps = {
  alt?: string;
  autoPlay?: boolean;
  embedID: string;
  loop?: boolean;
};

const YouTubeContent: FC<YouTubeContentProps> = ({ alt, autoPlay, embedID, loop }) => {
  const [{ youTubeContent: youTubeContentStyleSet }] = useStyleSet();

  const search = new URLSearchParams({
    autoplay: autoPlay ? '1' : '0',
    loop: loop ? '1' : '0',
    modestbranding: '1'
  }).toString();

  return (
    // TODO: We should encodeURI the URL
    <iframe
      allowFullScreen={true}
      aria-label={alt}
      className={youTubeContentStyleSet}
      src={`https://youtube.com/embed/${embedID}?${search}`}
    />
  );
};

YouTubeContent.defaultProps = {
  alt: '',
  autoPlay: false,
  loop: false
};

YouTubeContent.propTypes = {
  alt: PropTypes.string,
  autoPlay: PropTypes.bool,
  embedID: PropTypes.string.isRequired,
  loop: PropTypes.bool
};

export default YouTubeContent;
