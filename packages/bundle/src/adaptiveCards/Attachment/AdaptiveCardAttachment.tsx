import PropTypes from 'prop-types';
import React, { FC } from 'react';

import AdaptiveCardContent from './AdaptiveCardContent';
import DirectLineAttachment from '../../types/external/DirectLineAttachment';

type AdaptiveCardAttachmentProps = {
  attachment: DirectLineAttachment;
  disabled?: boolean;
};

const AdaptiveCardAttachment: FC<AdaptiveCardAttachmentProps> = ({ attachment: { content }, disabled }) => (
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
