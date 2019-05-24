import PropTypes from 'prop-types';
import React from 'react';

import AudioContent from './AudioContent';
import connectToWebChat from '../connectToWebChat';

const AudioAttachment = ({ attachment, styleSet }) => (
  <div className={styleSet.audioAttachment}>
    <AudioContent alt={attachment.name} src={attachment.contentUrl} />
  </div>
);

AudioAttachment.propTypes = {
  attachment: PropTypes.shape({
    contentUrl: PropTypes.string.isRequired,
    name: PropTypes.string
  }).isRequired,
  styleSet: PropTypes.shape({
    audioAttachment: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(AudioAttachment);
