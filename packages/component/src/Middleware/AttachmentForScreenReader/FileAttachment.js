import { hooks } from 'botframework-webchat-api';
import React from 'react';

const { useLocalizer } = hooks;

const FileAttachment = ({ attachment: { name = '' } = {} }) => {
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_FILE', name);

  return <div role="none">{label}</div>;
};

export default FileAttachment;
