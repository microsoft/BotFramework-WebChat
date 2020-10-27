import React from 'react';

import AudioAttachment from './AudioAttachment';
import FileAttachment from './FileAttachment';
import ImageAttachment from './ImageAttachment';
import TextAttachment from './TextAttachment';
import VideoAttachment from './VideoAttachment';

export default function createCoreMiddleware() {
  return [
    () => next => (...args) => {
      const [
        {
          activity: { from: { role } = {} } = {},
          attachment,
          attachment: { contentType, contentUrl, thumbnailUrl } = {}
        }
      ] = args;

      return role === 'user' && !/^text\//u.test(contentType) && !thumbnailUrl
        ? () => <FileAttachment attachment={attachment} />
        : /^audio\//u.test(contentType)
        ? () => <AudioAttachment />
        : /^image\//u.test(contentType)
        ? () => <ImageAttachment />
        : /^video\//u.test(contentType)
        ? () => <VideoAttachment />
        : contentUrl || contentType === 'application/octet-stream'
        ? () => <FileAttachment attachment={attachment} />
        : /^text\//u.test(contentType)
        ? () => <TextAttachment attachment={attachment} />
        : next(...args);
    }
  ];
}
