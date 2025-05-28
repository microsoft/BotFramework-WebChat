import { hooks } from 'botframework-webchat-api';
import { validateProps } from 'botframework-webchat-react-valibot';
import { type SendBoxAttachment } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useRefFrom } from 'use-ref-from';
import {
  custom,
  function_,
  instance,
  object,
  optional,
  picklist,
  pipe,
  readonly,
  safeParse,
  union,
  type InferInput
} from 'valibot';

import { useFocus, useStyleSet } from '../../hooks';
import testIds from '../../testIds';
import DeleteButton from './ItemDeleteButton';
import Preview from './ItemPreview';

const { useLocalizer } = hooks;

const sendBoxAttachmentBarItemPropsSchema = pipe(
  object({
    attachment: pipe(
      object({
        blob: union([instance(Blob), instance(File)]),
        thumbnailURL: optional(instance(URL))
      }),
      readonly()
    ),
    mode: picklist(['list item', 'thumbnail']),
    onDelete: optional(
      custom<(event: Readonly<{ attachment: SendBoxAttachment }>) => void>(
        value => safeParse(function_(), value).success
      )
    )
  }),
  readonly()
);

type SendBoxAttachmentBarItemProps = InferInput<typeof sendBoxAttachmentBarItemPropsSchema>;

function SendBoxAttachmentBarItem(props: SendBoxAttachmentBarItemProps) {
  const { attachment, mode, onDelete } = validateProps(sendBoxAttachmentBarItemPropsSchema, props);

  const [{ sendBoxAttachmentBarItem: sendBoxAttachmentBarItemClassName }] = useStyleSet();
  const attachmentRef = useRefFrom(attachment);
  const elementRef = useRef<HTMLDivElement>(null);
  const focus = useFocus();
  const localize = useLocalizer();
  const onDeleteRef = useRefFrom(onDelete);
  const shownRef = useRef<boolean>(false);

  const attachmentName = useMemo(
    () =>
      attachment.blob instanceof File
        ? attachment.blob.name
        : attachment.thumbnailURL
          ? localize('SEND_BOX_ATTACHMENT_BAR_GENERIC_IMAGE_ALT')
          : localize('SEND_BOX_ATTACHMENT_BAR_GENERIC_FILE_ALT'),
    [attachment, localize]
  );

  const handleDeleteButtonClick = useCallback(() => {
    onDeleteRef.current?.({ attachment: attachmentRef.current });

    // After delete, focus back to the send box.
    focus('sendBox');
  }, [attachmentRef, focus, onDeleteRef]);

  // If the item is newly added, scroll it into view.
  useEffect(() => {
    if (!shownRef.current) {
      shownRef.current = true;

      elementRef.current?.scrollIntoView();
    }
  }, [elementRef, shownRef]);

  return (
    <div
      className={classNames(sendBoxAttachmentBarItemClassName, 'webchat__send-box-attachment-bar-item', {
        'webchat__send-box-attachment-bar-item--as-list-item': mode === 'list item',
        'webchat__send-box-attachment-bar-item--as-thumbnail': mode === 'thumbnail'
      })}
      data-testid={testIds.sendBoxAttachmentBarItem}
      ref={elementRef}
      title={attachmentName}
    >
      <Preview attachment={attachment} attachmentName={attachmentName} mode={mode} />
      <DeleteButton
        attachmentName={attachmentName}
        onClick={handleDeleteButtonClick}
        size={mode === 'list item' ? 'small' : 'large'}
      />
    </div>
  );
}

export default memo(SendBoxAttachmentBarItem);
export { sendBoxAttachmentBarItemPropsSchema, type SendBoxAttachmentBarItemProps };
