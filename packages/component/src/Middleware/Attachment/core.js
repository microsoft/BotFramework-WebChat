import React from 'react';

import AudioAttachment from '../../Attachment/AudioAttachment';
import DownloadAttachment from '../../Attachment/DownloadAttachment';
import ImageAttachment from '../../Attachment/ImageAttachment';
import TextAttachment from '../../Attachment/TextAttachment';
import TypingActivity from '../../Attachment/TypingActivity';
import VideoAttachment from '../../Attachment/VideoAttachment';

// TODO: Rename this file or the whole middleware, it looks either too simple or too comprehensive now
export default () => {
  return next => {
    return ({ activity, attachment }) => {
      return (
        activity.type === 'typing' ?
          <TypingActivity />
        : attachment.contentType === 'application/vnd.microsoft.card.postback' ?
          false
        : /^audio\//.test(attachment.contentType) ?
          <AudioAttachment activity={ activity } attachment={ attachment } />
        : /^image\//.test(attachment.contentType) ?
          <ImageAttachment activity={ activity } attachment={ attachment } />
        : /^text\//.test(attachment.contentType) ?
          <TextAttachment activity={ activity } attachment={ attachment } />
        : /^video\//.test(attachment.contentType) ?
          <VideoAttachment activity={ activity } attachment={ attachment } />
        : attachment.contentType === 'application/octet-stream' ?
          <DownloadAttachment activity={ activity } attachment={ attachment } />
        :
          // TODO: The last one should be <UnknownAttachment>
          next({ activity, attachment })
      );
    };
  };
}
