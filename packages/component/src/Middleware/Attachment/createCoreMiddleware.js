import PropTypes from 'prop-types';
import React from 'react';

import AudioAttachment from '../../Attachment/AudioAttachment';
import DownloadAttachment from '../../Attachment/DownloadAttachment';
import ImageAttachment from '../../Attachment/ImageAttachment';
import UploadAttachment from '../../Attachment/UploadAttachment';
import TextAttachment from '../../Attachment/TextAttachment';
import VideoAttachment from '../../Attachment/VideoAttachment';

function hasThumbnail({ attachments = [], channelData: { attachmentThumbnails = [] } = {} }, attachment) {
  const attachmentIndex = attachments.indexOf(attachment);

  return !!attachmentThumbnails[attachmentIndex];
}

// TODO: [P4] Rename this file or the whole middleware, it looks either too simple or too comprehensive now
export default function createCoreMiddleware() {
  return () => next => {
    const Attachment = ({
      activity = {},
      activity: { from: { role } } = {},
      attachment,
      attachment: { contentType, contentUrl } = {}
    }) =>
      role === 'user' && !/^text\//u.test(contentType) && !hasThumbnail(activity, attachment) ? (
        <UploadAttachment activity={activity} attachment={attachment} />
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
