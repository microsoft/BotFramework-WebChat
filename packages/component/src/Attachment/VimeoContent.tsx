import PropTypes from 'prop-types';
import React, { FC } from 'react';

import useStyleSet from '../hooks/useStyleSet';

type VimeoContentProps = {
  alt?: string;
  autoPlay?: boolean;
  embedID: string;
  loop?: boolean;
};

const VimeoContent: FC<VimeoContentProps> = ({ alt, autoPlay, embedID, loop }) => {
  const [{ vimeoContent: vimeoContentStyleSet }] = useStyleSet();

  const search = new URLSearchParams({
    autoplay: autoPlay ? '1' : '0',
    badge: '0',
    byline: '0',
    loop: loop ? '1' : '0',
    portrait: '0',
    title: '0'
  }).toString();

  return (
    <iframe
      allowFullScreen={true}
      aria-label={alt}
      className={vimeoContentStyleSet}
      src={`https://player.vimeo.com/video/${encodeURI(embedID)}?${search}`}
    />
  );
};

VimeoContent.defaultProps = {
  alt: '',
  autoPlay: false,
  loop: false
};

VimeoContent.propTypes = {
  alt: PropTypes.string,
  autoPlay: PropTypes.bool,
  embedID: PropTypes.string.isRequired,
  loop: PropTypes.bool
};

export default VimeoContent;
