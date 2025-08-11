import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { type SendBoxAttachment } from 'botframework-webchat-core';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo } from 'react';
import { object, picklist, pipe, readonly, string, type InferInput } from 'valibot';

import FilePreview from './Preview/FilePreview';
import ImagePreview from './Preview/ImagePreview';
import { sendBoxAttachmentSchema } from './Preview/sendBoxAttachment';
import styles from './AttachmentBarItem.module.css';

const sendBoxAttachmentBarItemPreviewPropsSchema = pipe(
  object({
    attachment: sendBoxAttachmentSchema,
    attachmentName: string(),
    mode: picklist(['list item', 'thumbnail'])
  }),
  readonly()
);

type SendBoxAttachmentBarItemPreviewProps = InferInput<typeof sendBoxAttachmentBarItemPreviewPropsSchema>;

// TODO: Turn this into middleware.
function SendBoxAttachmentBarItemPreview(props: SendBoxAttachmentBarItemPreviewProps) {
  const { attachment, attachmentName, mode } = validateProps(sendBoxAttachmentBarItemPreviewPropsSchema, props);
  const classNames = useStyles(styles);

  let element: React.ReactNode;

  if (attachment.thumbnailURL) {
    element = (
      <ImagePreview
        attachment={attachment as SendBoxAttachment & { thumbnailURL: URL }}
        attachmentName={attachmentName}
        mode={mode}
      />
    );
  } else {
    element = (
      <FilePreview
        attachment={attachment as SendBoxAttachment & { blob: File }}
        attachmentName={attachmentName}
        mode={mode}
      />
    );
  }

  return <div className={classNames['send-box-attachment-bar-item__preview']}>{element}</div>;
}

export default memo(SendBoxAttachmentBarItemPreview);
export { sendBoxAttachmentBarItemPreviewPropsSchema, type SendBoxAttachmentBarItemPreviewProps };
