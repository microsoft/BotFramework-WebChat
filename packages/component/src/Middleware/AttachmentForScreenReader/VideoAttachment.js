import { hooks } from 'botframework-webchat-api';
import React from 'react';

const { useLocalizer } = hooks;

const VideoAttachment = () => {
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_VIDEO');

  return <article>{label}</article>;
};

export default VideoAttachment;
