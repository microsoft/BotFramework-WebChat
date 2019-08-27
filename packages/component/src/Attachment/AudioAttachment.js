import PropTypes from 'prop-types';
import React from 'react';

import AudioContent from './AudioContent';
import useStyleSet from '../hooks/useStyleSet';

const AudioAttachment = ({ attachment }) => {
  const styleSet = useStyleSet();

  return (
    <div className={styleSet.audioAttachment}>
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
