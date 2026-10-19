import { hooks } from 'botframework-webchat-api';
import React from 'react';

const { useLocalizer } = hooks;

const VideoAttachment = () => {
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_VIDEO');

  return <div role="none">{label}</div>;
};

export default VideoAttachment;
