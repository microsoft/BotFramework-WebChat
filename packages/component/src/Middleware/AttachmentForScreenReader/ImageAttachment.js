import { hooks } from 'botframework-webchat-api';
import React from 'react';

const { useLocalizer } = hooks;

const ImageAttachment = () => {
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_IMAGE');

  return <div>{label}</div>;
};

export default ImageAttachment;
