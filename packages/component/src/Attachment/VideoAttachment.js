import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import VideoContent from './VideoContent';

const ROOT_CSS = css({
  display: 'flex',
  flexDirection: 'column'
});

const VideoAttachment = ({ attachment, styleSet }) => (
  <div className={classNames(ROOT_CSS + '', styleSet.videoAttachment + '')}>
    <VideoContent alt={attachment.name} src={attachment.contentUrl} />
  </div>
);

VideoAttachment.propTypes = {
  attachment: PropTypes.shape({
    contentUrl: PropTypes.string.isRequired,
    name: PropTypes.string
  }).isRequired,
  styleSet: PropTypes.shape({
    videoAttachment: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(VideoAttachment);
