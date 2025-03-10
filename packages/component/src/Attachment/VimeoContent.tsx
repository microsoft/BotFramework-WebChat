import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React, { FC } from 'react';

import useStyleSet from '../hooks/useStyleSet';

const { useLocalizer } = hooks;

type VimeoContentProps = {
  alt?: string;
  autoPlay?: boolean;
  embedID: string;
  loop?: boolean;
};

const VimeoContent: FC<VimeoContentProps> = ({ alt, autoPlay, embedID, loop }) => {
  const [{ vimeoContent: vimeoContentStyleSet }] = useStyleSet();
  const localize = useLocalizer();

  const search = new URLSearchParams({
    autoplay: autoPlay ? '1' : '0',
    badge: '0',
    byline: '0',
    loop: loop ? '1' : '0',
    portrait: '0',
    title: '0'
  }).toString();
  const title = localize('ATTACHMENT_VIDEO');

  return (
    <iframe
      allowFullScreen={true}
      aria-label={alt}
      className={vimeoContentStyleSet}
      sandbox="allow-same-origin allow-scripts"
      src={`https://player.vimeo.com/video/${encodeURI(embedID)}?${search}`}
      title={title}
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
