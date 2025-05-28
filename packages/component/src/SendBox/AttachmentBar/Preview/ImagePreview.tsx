import { validateProps } from 'botframework-webchat-react-valibot';
import classNames from 'classnames';
import React, { memo } from 'react';
import { object, picklist, pipe, readonly, string, type InferInput } from 'valibot';

import { useStyleSet } from '../../../hooks';
import FilePreview from './FilePreview';
import { sendBoxAttachmentSchema } from './sendBoxAttachment';

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

  const [{ sendBoxAttachmentBarItemImagePreview: sendBoxAttachmentBarItemImagePreviewClassName }] = useStyleSet();

  return mode === 'list item' ? (
    <FilePreview attachment={attachment} attachmentName={attachmentName} mode={mode} />
  ) : (
    <img
      alt={attachmentName}
      className={classNames(
        sendBoxAttachmentBarItemImagePreviewClassName,
        'webchat__send-box-attachment-bar-item-image-preview'
      )}
      src={attachment.thumbnailURL.href}
    />
  );
}

export default memo(SendBoxAttachmentBarItemImageAttachmentPreview);
export {
  sendBoxAttachmentBarItemImageAttachmentPreviewPropsSchema,
  type SendBoxAttachmentBarItemImageAttachmentPreviewProps
};
