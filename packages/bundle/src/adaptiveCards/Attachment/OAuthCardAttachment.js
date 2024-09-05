import PropTypes from 'prop-types';
import React from 'react';

import OAuthCardContent from './OAuthCardContent';

const OAuthCardAttachment = ({ attachment: { content } = {}, disabled = undefined }) => (
  <OAuthCardContent content={content} disabled={disabled} />
);

OAuthCardAttachment.propTypes = {
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      buttons: PropTypes.array
    }).isRequired
  }).isRequired,
  disabled: PropTypes.bool
};

export default OAuthCardAttachment;
