import PropTypes from 'prop-types';
import React, { FC } from 'react';

import useStyleSet from '../hooks/useStyleSet';

type HTMLVideoContentProps = {
  alt?: string;
  autoPlay?: boolean;
  loop?: boolean;
  poster?: string;
  src: string;
};

const HTMLVideoContent: FC<HTMLVideoContentProps> = ({ alt = '', autoPlay = false, loop = false, poster = '', src }) => {
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
};

HTMLVideoContent.propTypes = {
  alt: PropTypes.string,
  autoPlay: PropTypes.bool,
  loop: PropTypes.bool,
  poster: PropTypes.string,
  src: PropTypes.string.isRequired
};

export default HTMLVideoContent;
