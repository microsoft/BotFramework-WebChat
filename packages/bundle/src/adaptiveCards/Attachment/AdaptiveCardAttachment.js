import PropTypes from 'prop-types';
import React from 'react';

import AdaptiveCardContent from './AdaptiveCardContent';

const AdaptiveCardAttachment = ({ attachment: { content }, disabled }) => (
  <AdaptiveCardContent content={content} disabled={disabled} />
);

export default AdaptiveCardAttachment;

AdaptiveCardAttachment.defaultProps = {
  disabled: undefined
};

AdaptiveCardAttachment.propTypes = {
  attachment: PropTypes.shape({
    content: PropTypes.any.isRequired
  }).isRequired,
  disabled: PropTypes.bool
};
