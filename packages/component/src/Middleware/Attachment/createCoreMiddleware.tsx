import { AttachmentMiddleware } from 'botframework-webchat-api';
import React from 'react';

import AudioAttachment from '../../Attachment/AudioAttachment';
import FileAttachment from '../../Attachment/FileAttachment';
import ImageAttachment from '../../Attachment/ImageAttachment';
import TextAttachment from '../../Attachment/TextAttachment';
import VideoAttachment from '../../Attachment/VideoAttachment';

// TODO: [P4] Rename this file or the whole middleware, it looks either too simple or too comprehensive now
export default function createCoreMiddleware(): AttachmentMiddleware[] {
  return [
    () =>
      next =>
      (...args) => {
        const [
          {
            activity = {},
            activity: { from: { role = undefined } = {} } = {},
            attachment,
            attachment: { contentType = undefined, contentUrl = undefined, thumbnailUrl = undefined } = {}
          }
        ] = args;

        const isText = /^text\//u.test(contentType);

        return (isText ? !attachment.content : role === 'user' && !thumbnailUrl) ? (
          <FileAttachment activity={activity} attachment={attachment} />
        ) : /^audio\//u.test(contentType) ? (
          <AudioAttachment attachment={attachment} />
        ) : /^image\//u.test(contentType) ? (
          <ImageAttachment attachment={attachment} />
        ) : /^video\//u.test(contentType) ? (
          <VideoAttachment attachment={attachment} />
        ) : contentUrl || contentType === 'application/octet-stream' ? (
          <FileAttachment activity={activity} attachment={attachment} />
        ) : isText ? (
          <TextAttachment attachment={attachment} />
        ) : (
          next(...args)
        );
      }
  ];
}
