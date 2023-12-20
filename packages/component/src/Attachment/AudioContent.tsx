import PropTypes from 'prop-types';
import React, { type ReactNode } from 'react';

import useStyleSet from '../hooks/useStyleSet';

type AudioContentProps = Readonly<{
  alt?: string;
  autoPlay?: boolean;
  loop?: boolean;
  poster?: string;
  src: string;
}>;

const AudioContent = ({ alt, autoPlay, loop, src }: AudioContentProps): ReactNode => {
  const [{ audioContent: audioContentStyleSet }] = useStyleSet();

  return (
    <audio
      aria-label={alt}
      autoPlay={autoPlay}
      className={audioContentStyleSet}
      controls={true}
      loop={loop}
      src={src}
    />
  );
};

AudioContent.defaultProps = {
  alt: '',
  autoPlay: false,
  loop: false,
  poster: ''
};

AudioContent.propTypes = {
  alt: PropTypes.string,
  autoPlay: PropTypes.bool,
  loop: PropTypes.bool,
  // We will keep the "poster" prop for #3315.
  // eslint-disable-next-line react/no-unused-prop-types
  poster: PropTypes.string,
  src: PropTypes.string.isRequired
};

export default AudioContent;
