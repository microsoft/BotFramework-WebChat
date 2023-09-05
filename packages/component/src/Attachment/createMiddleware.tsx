import React from 'react';

import AudioAttachment from './AudioAttachment';
import FileAttachment from './FileAttachment';
import ImageAttachment from './ImageAttachment';
import TextAttachment from './Text/TextAttachment';
import VideoAttachment from './VideoAttachment';

import { type AttachmentMiddleware } from 'botframework-webchat-api';
import { type WebChatAttachment } from './private/types/WebChatAttachment';

function isTextAttachment(
  attachment: WebChatAttachment
): attachment is WebChatAttachment & { contentType: `text/${string}` } {
  return attachment.contentType.startsWith('text/');
}

// TODO: [P4] Rename this file or the whole middleware, it looks either too simple or too comprehensive now
export default function createCoreMiddleware(): AttachmentMiddleware[] {
  return [
    () =>
      next =>
      (...args) => {
        const [
          {
            activity,
            activity: { from: { role = undefined } = {} } = {},
            attachment,
            attachment: { contentType = undefined, contentUrl = undefined, thumbnailUrl = undefined } = {}
          }
        ] = args;

        const isText = isTextAttachment(attachment);

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
          <TextAttachment activity={activity} attachment={attachment} />
        ) : (
          next(...args)
        );
      }
  ];
}
