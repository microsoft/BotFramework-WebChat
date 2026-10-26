import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import PropTypes from 'prop-types';
import React from 'react';

import VideoContent from './VideoContent';

import styles from './VideoAttachment.module.css';

const VideoAttachment = ({ attachment }) => {
  const classNames = useStyles(styles);

  return (
    <div className={classNames['video-attachment']}>
      <VideoContent alt={attachment.name} src={attachment.contentUrl} />
    </div>
  );
};

VideoAttachment.propTypes = {
  attachment: PropTypes.shape({
    contentUrl: PropTypes.string.isRequired,
    name: PropTypes.string
  }).isRequired
};

export default VideoAttachment;
