import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import React from 'react';
import { object, optional, pipe, readonly, string } from 'valibot';

import AudioContent from './AudioContent';

import styles from './MediaAttachment.module.css';

const audioAttachmentPropsSchema = pipe(
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

const AudioAttachment = props => {
  const { attachment } = validateProps(audioAttachmentPropsSchema, props);

  const classNames = useStyles(styles, webChatPrefixedClassName);

  return (
    <div className={classNames['audio-attachment']}>
      <AudioContent alt={attachment.name} src={attachment.contentUrl} />
    </div>
  );
};

export default AudioAttachment;
