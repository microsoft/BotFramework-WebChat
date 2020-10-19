import PropTypes from 'prop-types';
import React from 'react';

import useLocalizer from '../../hooks/useLocalizer';

const TextAttachment = ({ attachment: { content = '' } = {} }) => {
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_TEXT', content);

  return <div>{label}</div>;
};

TextAttachment.propTypes = {
  attachment: PropTypes.shape({
    content: PropTypes.string.isRequired
  }).isRequired
};

export default TextAttachment;
