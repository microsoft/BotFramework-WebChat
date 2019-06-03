import PropTypes from 'prop-types';
import React from 'react';

import AudioAttachment from '../../Attachment/AudioAttachment';
import DownloadAttachment from '../../Attachment/DownloadAttachment';
import ImageAttachment from '../../Attachment/ImageAttachment';
import TextAttachment from '../../Attachment/TextAttachment';
import TypingActivity from '../../Attachment/TypingActivity';
import VideoAttachment from '../../Attachment/VideoAttachment';

// TODO: [P4] Rename this file or the whole middleware, it looks either too simple or too comprehensive now
export default function createCoreMiddleware() {
  return () => next => {
    const Attachment = ({ activity = {}, attachment, attachment: { contentType, contentUrl } = {} }) =>
      activity.type === 'typing' ? (
        <TypingActivity />
      ) : /^audio\//u.test(contentType) ? (
        <AudioAttachment activity={activity} attachment={attachment} />
      ) : /^image\//u.test(contentType) ? (
        <ImageAttachment activity={activity} attachment={attachment} />
      ) : /^video\//u.test(contentType) ? (
        <VideoAttachment activity={activity} attachment={attachment} />
      ) : contentUrl || contentType === 'application/octet-stream' ? (
        <DownloadAttachment activity={activity} attachment={attachment} />
      ) : /^text\//u.test(contentType) ? (
        <TextAttachment activity={activity} attachment={attachment} />
      ) : (
        next({ activity, attachment })
      );

    Attachment.propTypes = {
      activity: PropTypes.any.isRequired,
      attachment: PropTypes.shape({
        contentType: PropTypes.string.isRequired,
        contentUrl: PropTypes.string.isRequired
      }).isRequired
    };

    return Attachment;
  };
}
