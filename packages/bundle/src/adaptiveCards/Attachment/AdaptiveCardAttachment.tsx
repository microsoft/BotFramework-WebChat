import PropTypes from 'prop-types';
import React, { FC } from 'react';
import type { DirectLineAttachment } from 'botframework-webchat-core';

import AdaptiveCardContent from './AdaptiveCardContent';

type AdaptiveCardAttachmentProps = {
  attachment: DirectLineAttachment;
  disabled?: boolean;
  activityId?: string;
};

const AdaptiveCardAttachment: FC<AdaptiveCardAttachmentProps> = ({ attachment: { content }, disabled, activityId }) => (
  <AdaptiveCardContent activityId={activityId} content={content} disabled={disabled} />
);

export default AdaptiveCardAttachment;

AdaptiveCardAttachment.defaultProps = {
  activityId: undefined,
  disabled: undefined
};

AdaptiveCardAttachment.propTypes = {
  activityId: PropTypes.string,
  // PropTypes cannot fully capture TypeScript types.
  // @ts-ignore
  attachment: PropTypes.shape({
    content: PropTypes.any.isRequired
  }).isRequired,
  disabled: PropTypes.bool
};
