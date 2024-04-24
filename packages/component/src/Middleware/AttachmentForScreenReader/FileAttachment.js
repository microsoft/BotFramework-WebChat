import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React from 'react';

const { useLocalizer } = hooks;

const FileAttachment = ({ attachment: { name = '' } = {} }) => {
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_FILE', name);

  return <article>{label}</article>;
};

FileAttachment.propTypes = {
  attachment: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired
};

export default FileAttachment;
