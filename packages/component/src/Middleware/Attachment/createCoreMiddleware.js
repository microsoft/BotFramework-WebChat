import React from 'react';

import AudioAttachment from '../../Attachment/AudioAttachment';
import FileAttachment from '../../Attachment/FileAttachment';
import ImageAttachment from '../../Attachment/ImageAttachment';
import TextAttachment from '../../Attachment/TextAttachment';
import VideoAttachment from '../../Attachment/VideoAttachment';

// TODO: [P4] Rename this file or the whole middleware, it looks either too simple or too comprehensive now
export default function createCoreMiddleware() {
  return [
    // This is not returning a React component, but a render function.
    /* eslint-disable-next-line react/display-name */
    () => next => (...args) => {
      const [
        {
          activity = {},
          activity: { from: { role } = {} } = {},
          attachment,
          attachment: { contentType, contentUrl, thumbnailUrl } = {}
        }
      ] = args;

      return role === 'user' && !/^text\//u.test(contentType) && !thumbnailUrl ? (
        <FileAttachment activity={activity} attachment={attachment} />
      ) : /^audio\//u.test(contentType) ? (
        <AudioAttachment activity={activity} attachment={attachment} />
      ) : /^image\//u.test(contentType) ? (
        <ImageAttachment activity={activity} attachment={attachment} />
      ) : /^video\//u.test(contentType) ? (
        <VideoAttachment activity={activity} attachment={attachment} />
      ) : contentUrl || contentType === 'application/octet-stream' ? (
        <FileAttachment activity={activity} attachment={attachment} />
      ) : /^text\//u.test(contentType) ? (
        <TextAttachment activity={activity} attachment={attachment} />
      ) : (
        next(...args)
      );
    }
  ];
}
