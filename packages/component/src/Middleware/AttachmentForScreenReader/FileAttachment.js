/* eslint-disable react/forbid-dom-props */
import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React from 'react';

import useUniqueId from '../../hooks/internal/useUniqueId';

const { useLocalizer } = hooks;

const FileAttachment = ({ attachment: { name = '' } = {} }) => {
  const labelId = useUniqueId('webchat__id');
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_FILE', name);

  return (
    <article aria-labelledby={labelId}>
      <div id={labelId}>{label}</div>
    </article>
  );
};

FileAttachment.propTypes = {
  attachment: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired
};

export default FileAttachment;
