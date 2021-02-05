/* eslint-disable react/forbid-dom-props */
import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React from 'react';

import useUniqueId from '../../hooks/internal/useUniqueId';

const { useLocalizer } = hooks;

const TextAttachment = ({ attachment: { content = '' } = {} }) => {
  const labelId = useUniqueId('webchat__id');
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_TEXT', content);

  return (
    <article aria-labelledby={labelId}>
      <div id={labelId}>{label}</div>
    </article>
  );
};

TextAttachment.propTypes = {
  attachment: PropTypes.shape({
    content: PropTypes.string.isRequired
  }).isRequired
};

export default TextAttachment;
