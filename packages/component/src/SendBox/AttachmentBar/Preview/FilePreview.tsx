import { validateProps } from 'botframework-webchat-api/internal';
import classNames from 'classnames';
import React, { memo } from 'react';
import { object, picklist, pipe, readonly, string, type InferInput } from 'valibot';

import { useStyleSet } from '../../../hooks';
import FileIcon from './FileIcon';
import ImageIcon from './ImageIcon';
import { sendBoxAttachmentSchema } from './sendBoxAttachment';

const sendBoxAttachmentBarItemFileAttachmentPreviewPropsSchema = pipe(
  object({
    attachment: sendBoxAttachmentSchema,
    attachmentName: string(),
    mode: picklist(['list item', 'thumbnail'])
  }),
  readonly()
);

type SendBoxAttachmentBarItemFileAttachmentPreviewProps = InferInput<
  typeof sendBoxAttachmentBarItemFileAttachmentPreviewPropsSchema
>;

function SendBoxAttachmentBarItemFileAttachmentPreview(props: SendBoxAttachmentBarItemFileAttachmentPreviewProps) {
  const { attachment, mode, attachmentName } = validateProps(
    sendBoxAttachmentBarItemFileAttachmentPreviewPropsSchema,
    props
  );

  const [{ sendBoxAttachmentBarItemFilePreview: sendBoxAttachmentBarItemFilePreviewClassName }] = useStyleSet();

  return mode === 'list item' ? (
    <div
      className={classNames(
        sendBoxAttachmentBarItemFilePreviewClassName,
        'webchat__send-box-attachment-bar-item-file-preview',
        'webchat__send-box-attachment-bar-item-file-preview--as-list-item'
      )}
    >
      {attachment.thumbnailURL ? <ImageIcon /> : <FileIcon />}
      <div className="webchat__send-box-attachment-bar-item-file-preview__text">{attachmentName}</div>
    </div>
  ) : (
    <div
      className={classNames(
        sendBoxAttachmentBarItemFilePreviewClassName,
        'webchat__send-box-attachment-bar-item-file-preview',
        'webchat__send-box-attachment-bar-item-file-preview--as-thumbnail'
      )}
    >
      <FileIcon size="large" />
    </div>
  );
}

export default memo(SendBoxAttachmentBarItemFileAttachmentPreview);
export {
  sendBoxAttachmentBarItemFileAttachmentPreviewPropsSchema,
  type SendBoxAttachmentBarItemFileAttachmentPreviewProps
};
