import React from 'react';

import AudioAttachment from '../../Attachment/AudioAttachment';
import DownloadAttachment from '../../Attachment/DownloadAttachment';
import ImageAttachment from '../../Attachment/ImageAttachment';
import TextAttachment from '../../Attachment/TextAttachment';
import TypingActivity from '../../Attachment/TypingActivity';
import VideoAttachment from '../../Attachment/VideoAttachment';

// TODO: [P4] Rename this file or the whole middleware, it looks either too simple or too comprehensive now
export default function () {
  return () => next => ({ activity, attachment, attachment: { contentType } }) =>
    activity.type === 'typing' ?
      <TypingActivity />
    : /^audio\//.test(contentType) ?
      <AudioAttachment activity={ activity } attachment={ attachment } />
    : /^image\//.test(contentType) ?
      <ImageAttachment activity={ activity } attachment={ attachment } />
    : /^video\//.test(contentType) ?
      <VideoAttachment activity={ activity } attachment={ attachment } />
    : (attachment.contentUrl || contentType === 'application/octet-stream') ?
      <DownloadAttachment activity={ activity } attachment={ attachment } />
    : /^text\//.test(contentType) ?
      <TextAttachment activity={ activity } attachment={ attachment } />
    :
      next({ activity, attachment });
}
