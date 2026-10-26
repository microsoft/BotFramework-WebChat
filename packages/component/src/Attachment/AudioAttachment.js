import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import PropTypes from 'prop-types';
import React from 'react';

import AudioContent from './AudioContent';

import styles from './AudioAttachment.module.css';

const AudioAttachment = ({ attachment }) => {
  const classNames = useStyles(styles);

  return (
    <div className={classNames['audio-attachment']}>
      <AudioContent alt={attachment.name} src={attachment.contentUrl} />
    </div>
  );
};

AudioAttachment.propTypes = {
  attachment: PropTypes.shape({
    contentUrl: PropTypes.string.isRequired,
    name: PropTypes.string
  }).isRequired
};

export default AudioAttachment;
