import PropTypes from 'prop-types';
import React, { type ReactNode } from 'react';

import useStyleSet from '../hooks/useStyleSet';

type HTMLVideoContentProps = Readonly<{
  alt?: string;
  autoPlay?: boolean;
  loop?: boolean;
  poster?: string;
  src: string;
}>;

const HTMLVideoContent = ({ alt, autoPlay, loop, poster, src }: HTMLVideoContentProps): ReactNode => {
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

HTMLVideoContent.defaultProps = {
  alt: '',
  autoPlay: false,
  loop: false,
  poster: ''
};

HTMLVideoContent.propTypes = {
  alt: PropTypes.string,
  autoPlay: PropTypes.bool,
  loop: PropTypes.bool,
  poster: PropTypes.string,
  src: PropTypes.string.isRequired
};

export default HTMLVideoContent;
