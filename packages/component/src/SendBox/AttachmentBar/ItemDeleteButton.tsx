import { hooks } from 'botframework-webchat-api';
import { validateProps } from 'botframework-webchat-api/internal';
import classNames from 'classnames';
import React, { KeyboardEventHandler, useCallback } from 'react';
import { function_, object, optional, picklist, pipe, readonly, string, type InferInput } from 'valibot';

import { useFocus } from '../../hooks';
import ModdableIcon from '../../ModdableIcon/ModdableIcon';
import testIds from '../../testIds';

const { useLocalizer } = hooks;

const attachmentDeleteButtonPropsSchema = pipe(
  object({
    attachmentName: string(),
    onClick: optional(function_()),
    size: optional(picklist(['large', 'small']))
  }),
  readonly()
);

type AttachmentDeleteButtonProps = InferInput<typeof attachmentDeleteButtonPropsSchema>;

function AttachmentDeleteButton(props: AttachmentDeleteButtonProps) {
  const { attachmentName, onClick, size } = validateProps(attachmentDeleteButtonPropsSchema, props);

  const focus = useFocus();
  const localize = useLocalizer();

  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLButtonElement>>(
    event => {
      if (event.key === 'Escape') {
        event.preventDefault();

        focus('sendBox');
      }
    },
    [focus]
  );

  return (
    <button
      aria-label={localize('SEND_BOX_ATTACHMENT_BAR_DELETE_BUTTON_ALT', attachmentName)}
      className={classNames('webchat__send-box-attachment-bar-item__delete-button', {
        'webchat__send-box-attachment-bar-item__delete-button--large': size === 'large',
        'webchat__send-box-attachment-bar-item__delete-button--small': size !== 'large'
      })}
      data-testid={testIds.sendBoxAttachmentBarItemDeleteButton}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      title={localize('SEND_BOX_ATTACHMENT_BAR_DELETE_BUTTON_TOOLTIP')}
      type="button"
    >
      <ModdableIcon />
    </button>
  );
}

export default AttachmentDeleteButton;
export { attachmentDeleteButtonPropsSchema, type AttachmentDeleteButtonProps };
