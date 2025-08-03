import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo } from 'react';
import { object, picklist, pipe, readonly, string, type InferInput } from 'valibot';

import FilePreview from './FilePreview';
import { sendBoxAttachmentSchema } from './sendBoxAttachment';
import styles from './ImagePreview.module.css';

const sendBoxAttachmentBarItemImageAttachmentPreviewPropsSchema = pipe(
  object({
    attachment: sendBoxAttachmentSchema,
    attachmentName: string(),
    mode: picklist(['list item', 'thumbnail'])
  }),
  readonly()
);

type SendBoxAttachmentBarItemImageAttachmentPreviewProps = InferInput<
  typeof sendBoxAttachmentBarItemImageAttachmentPreviewPropsSchema
>;

function SendBoxAttachmentBarItemImageAttachmentPreview(props: SendBoxAttachmentBarItemImageAttachmentPreviewProps) {
  const { attachment, mode, attachmentName } = validateProps(
    sendBoxAttachmentBarItemImageAttachmentPreviewPropsSchema,
    props
  );

  const classNames = useStyles(styles); // Renamed to avoid conflict with classnames import

  return mode === 'list item' ? (
    <FilePreview attachment={attachment} attachmentName={attachmentName} mode={mode} />
  ) : (
    <img
      alt={attachmentName}
      className={classNames['send-box-attachment-bar-item-image-preview']}
      src={attachment.thumbnailURL.href}
    />
  );
}

export default memo(SendBoxAttachmentBarItemImageAttachmentPreview);
export {
  sendBoxAttachmentBarItemImageAttachmentPreviewPropsSchema,
  type SendBoxAttachmentBarItemImageAttachmentPreviewProps
};
