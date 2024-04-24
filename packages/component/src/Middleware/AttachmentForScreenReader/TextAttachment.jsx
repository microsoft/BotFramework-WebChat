import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React from 'react';

const { useLocalizer } = hooks;

const TextAttachment = ({ attachment: { content = '' } = {} }) => {
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_TEXT', content);

  return <article>{label}</article>;
};

TextAttachment.propTypes = {
  attachment: PropTypes.shape({
    content: PropTypes.string.isRequired
  }).isRequired
};

export default TextAttachment;
