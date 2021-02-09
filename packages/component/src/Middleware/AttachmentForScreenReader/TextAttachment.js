/* eslint-disable react/forbid-dom-props */
import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React from 'react';

import FileAttachment from './FileAttachment';
import useUniqueId from '../../hooks/internal/useUniqueId';

const { useLocalizer } = hooks;

const TextAttachment = ({ activity, attachment, attachment: { content = '' } = {} }) => {
  const labelId = useUniqueId('webchat__id');
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_TEXT', content);

  if (!attachment.content) {
    return <FileAttachment activity={activity} attachment={attachment} />;
  }

  return (
    <article aria-labelledby={labelId}>
      <div id={labelId}>{label}</div>
    </article>
  );
};

TextAttachment.propTypes = {
  activity: PropTypes.any.isRequired,
  attachment: PropTypes.shape({
    content: PropTypes.string.isRequired
  }).isRequired
};

export default TextAttachment;
