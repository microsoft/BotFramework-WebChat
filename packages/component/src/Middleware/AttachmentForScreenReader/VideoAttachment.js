import React from 'react';

import useLocalizer from '../../hooks/useLocalizer';

const VideoAttachment = () => {
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_VIDEO');

  return <div>{label}</div>;
};

export default VideoAttachment;
