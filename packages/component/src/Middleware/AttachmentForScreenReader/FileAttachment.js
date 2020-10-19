import PropTypes from 'prop-types';
import React from 'react';

import useLocalizer from '../../hooks/useLocalizer';

const FileAttachment = ({ attachment: { name = '' } = {} }) => {
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_FILE', name);

  return <div>{label}</div>;
};

FileAttachment.propTypes = {
  attachment: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired
};

export default FileAttachment;
