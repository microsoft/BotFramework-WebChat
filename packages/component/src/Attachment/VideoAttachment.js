import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import React from 'react';
import { object, optional, pipe, readonly, string } from 'valibot';

import VideoContent from './VideoContent';

import styles from './MediaAttachment.module.css';

const videoAttachmentPropsSchema = pipe(
  object({
    attachment: pipe(
      object({
        contentUrl: string(),
        name: optional(string())
      }),
      readonly()
    )
  }),
  readonly()
);

const VideoAttachment = props => {
  const { attachment } = validateProps(videoAttachmentPropsSchema, props);

  const classNames = useStyles(styles, webChatPrefixedClassName);

  return (
    <div className={classNames['video-attachment']}>
      <VideoContent alt={attachment.name} src={attachment.contentUrl} />
    </div>
  );
};

export default VideoAttachment;
