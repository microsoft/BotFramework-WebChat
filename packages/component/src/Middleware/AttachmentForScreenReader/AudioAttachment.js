/* eslint-disable react/forbid-dom-props */
import { hooks } from 'botframework-webchat-api';
import React from 'react';

import useUniqueId from '../../hooks/internal/useUniqueId';

const { useLocalizer } = hooks;

const AudioAttachment = () => {
  const labelId = useUniqueId('webchat__id');
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_AUDIO');

  return (
    <article aria-labelledby={labelId}>
      <div id={labelId}>{label}</div>
    </article>
  );
};

export default AudioAttachment;
