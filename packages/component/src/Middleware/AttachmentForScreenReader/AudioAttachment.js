import React from 'react';

import useLocalizer from '../../hooks/useLocalizer';

const AudioAttachment = () => {
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_AUDIO');

  return <div>{label}</div>;
};

export default AudioAttachment;
