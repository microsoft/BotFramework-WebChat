import React from 'react';

import AudioContent from './AudioContent';
import useStyleSet from '../hooks/useStyleSet';

const AudioAttachment = ({ attachment }) => {
  const [{ audioAttachment: audioAttachmentStyleSet }] = useStyleSet();

  return (
    <div className={audioAttachmentStyleSet}>
      <AudioContent alt={attachment.name} src={attachment.contentUrl} />
    </div>
  );
};

export default AudioAttachment;
