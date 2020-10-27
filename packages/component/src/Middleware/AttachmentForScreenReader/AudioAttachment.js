import { hooks } from 'botframework-webchat-api';
import React from 'react';

const { useLocalizer } = hooks;

const AudioAttachment = () => {
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_AUDIO');

  return <div>{label}</div>;
};

export default AudioAttachment;
