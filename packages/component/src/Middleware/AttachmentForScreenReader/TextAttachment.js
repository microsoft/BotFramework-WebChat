import { hooks } from 'botframework-webchat-api';
import React from 'react';

const { useLocalizer } = hooks;

const TextAttachment = ({ attachment: { content = '' } = {} }) => {
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_TEXT', content);

  return <div role="none">{label}</div>;
};

export default TextAttachment;
