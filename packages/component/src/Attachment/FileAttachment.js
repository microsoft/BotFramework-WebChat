import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React from 'react';
import { any, array, number, object, optional, pipe, readonly, string } from 'valibot';

import FileContent from './FileContent';

const fileAttachmentPropsSchema = pipe(
  object({
    activity: pipe(
      object({
        attachments: optional(array(any())),
        channelData: optional(pipe(object({ attachmentSizes: optional(array(number())) }), readonly()))
      }),
      readonly()
    ),
    attachment: pipe(
      object({
        contentUrl: optional(string()),
        name: string()
      }),
      readonly()
    )
  }),
  readonly()
);

const FileAttachment = props => {
  const { activity: { attachments = [], channelData: { attachmentSizes = [] } = {} } = {}, attachment } = validateProps(
    fileAttachmentPropsSchema,
    props
  );
  const attachmentIndex = attachments.indexOf(attachment);
  const size = attachmentSizes[+attachmentIndex];

  return <FileContent fileName={attachment.name} href={attachment.contentUrl} size={size} />;
};

export default FileAttachment;
