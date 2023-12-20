import PropTypes from 'prop-types';
import React, { type ReactNode } from 'react';
import { type DirectLineAttachment } from 'botframework-webchat-core';

import AdaptiveCardContent from './AdaptiveCardContent';

type AdaptiveCardAttachmentProps = Readonly<{
  attachment: DirectLineAttachment;
  disabled?: boolean;
}>;

const AdaptiveCardAttachment = ({ attachment: { content }, disabled }: AdaptiveCardAttachmentProps): ReactNode => (
  <AdaptiveCardContent content={content} disabled={disabled} />
);

export default AdaptiveCardAttachment;

AdaptiveCardAttachment.defaultProps = {
  disabled: undefined
};

AdaptiveCardAttachment.propTypes = {
  // PropTypes cannot fully capture TypeScript types.
  // @ts-ignore
  attachment: PropTypes.shape({
    content: PropTypes.any.isRequired
  }).isRequired,
  disabled: PropTypes.bool
};
