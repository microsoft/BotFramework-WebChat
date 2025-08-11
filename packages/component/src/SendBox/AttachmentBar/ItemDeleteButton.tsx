import { hooks } from 'botframework-webchat-api';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { KeyboardEventHandler, useCallback } from 'react';
import { function_, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import { useFocus } from '../../hooks';
import { ComponentIcon } from '../../Icon';
import testIds from '../../testIds';
import styles from './AttachmentBarItem.module.css';

const { useLocalizer } = hooks;

const attachmentDeleteButtonPropsSchema = pipe(
  object({
    attachmentName: string(),
    onClick: optional(function_())
  }),
  readonly()
);

type AttachmentDeleteButtonProps = InferInput<typeof attachmentDeleteButtonPropsSchema>;

function AttachmentDeleteButton(props: AttachmentDeleteButtonProps) {
  const { attachmentName, onClick } = validateProps(attachmentDeleteButtonPropsSchema, props);
  const classNames = useStyles(styles);
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
      className={classNames['send-box-attachment-bar-item__delete-button']}
      data-testid={testIds.sendBoxAttachmentBarItemDeleteButton}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      title={localize('SEND_BOX_ATTACHMENT_BAR_DELETE_BUTTON_TOOLTIP')}
      type="button"
    >
      <ComponentIcon
        appearance="text"
        className={classNames['send-box-attachment-bar-item__dismiss-icon']}
        icon="dismiss"
      />
    </button>
  );
}

export default AttachmentDeleteButton;
export { attachmentDeleteButtonPropsSchema, type AttachmentDeleteButtonProps };
