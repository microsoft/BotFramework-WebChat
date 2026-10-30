import { reactNode, validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { memo, useCallback, useLayoutEffect, useRef } from 'react';
import { custom, function_, is, object, optional, pipe, readonly, string } from 'valibot';

import { ComponentIcon } from '../../../Icon';

import styles from './Popover.module.css';

const { useLocalizer } = hooks;

const modalDialogPropsSchema = pipe(
  object({
    'aria-label': optional(string()),
    'aria-labelledby': optional(string()),
    children: optional(reactNode()),
    className: optional(string()),
    onDismiss: optional(custom<() => void>(value => is(function_(), value)))
  }),
  readonly()
);

type ModalDialogProps = InferReactProps<typeof modalDialogPropsSchema>;

function ModalDialog(props: ModalDialogProps) {
  const {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    children,
    className,
    onDismiss
  } = validateProps(modalDialogPropsSchema, props);

  // Keeps the "webchat__modal-dialog" class names.
  const classNames = useStyles(styles, webChatPrefixedClassName);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const localize = useLocalizer();

  const closeButtonAlt = localize('CLOSE_BUTTON_ALT');

  const handleCloseButtonClick = useCallback(() => dialogRef.current?.close(), [dialogRef]);

  useLayoutEffect(() => dialogRef.current?.showModal(), [dialogRef]);

  return (
    <dialog
      // When "aria-labelledby" is set, it must not set "aria-label".
      aria-label={!ariaLabelledBy ? ariaLabel : undefined}
      aria-labelledby={ariaLabelledBy}
      className={cx(classNames['modal-dialog'], className)}
      onClose={onDismiss}
      open={false}
      ref={dialogRef}
      role="dialog"
    >
      <div className={classNames['modal-dialog__box']}>
        {/* The __scrollable layer is for hiding scrollbar at corners.
            Without this layer, the scrollbar will show and overflow the border-radius.
            This impact will be more visible if we temporarily set border-radius: 20px. */}
        <div className={classNames['modal-dialog__close-button-layout']}>
          <button
            aria-label={closeButtonAlt}
            className={classNames['modal-dialog__close-button']}
            onClick={handleCloseButtonClick}
            type="button"
          >
            <ComponentIcon appearance="text" className={classNames['modal-dialog__close-button-icon']} icon="dismiss" />
          </button>
        </div>
        <div className={classNames['modal-dialog__body']}>{children}</div>
      </div>
    </dialog>
  );
}

ModalDialog.displayName = 'ModalDialog';

export default memo(ModalDialog);
export { modalDialogPropsSchema, type ModalDialogProps };
