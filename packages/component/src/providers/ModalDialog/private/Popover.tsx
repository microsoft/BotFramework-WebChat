import { hooks } from 'botframework-webchat-api';
import { useRefFrom } from 'use-ref-from';
import classNames from 'classnames';
import React, { memo, type PropsWithChildren, useCallback, useEffect, useRef } from 'react';

import useStyleSet from '../../../hooks/useStyleSet';

const { useLocalizer } = hooks;

// defaultProps is being deprecated.
// eslint-disable-next-line react/require-default-props
type Props = PropsWithChildren<{ labelId?: string; onDismiss?: () => void }>;

const ModalDialog = memo(({ children, labelId, onDismiss }: Props) => {
  const [{ modalDialog: modalDialogStyleSet }] = useStyleSet();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const localize = useLocalizer();
  const onDismissRef = useRefFrom(onDismiss);

  const closeButtonAlt = localize('KEYBOARD_HELP_CLOSE_BUTTON_ALT');

  const handleCloseButtonClick = useCallback(() => dialogRef.current?.close(), [dialogRef]);
  const handleClose = useCallback(() => onDismissRef.current?.(), [onDismissRef]);

  useEffect(() => dialogRef.current?.showModal(), [dialogRef]);

  return (
    <dialog
      aria-labelledby={labelId}
      className={classNames('webchat__modal-dialog', modalDialogStyleSet + '')}
      onClose={handleClose}
      open={false}
      ref={dialogRef}
      role="dialog"
    >
      <div className="webchat__modal-dialog__box">
        {/* The __scrollable layer is for hiding scrollbar at corners.
              Without this layer, the scrollbar will show and overflow the border-radius.
            This impact will be more visible if we temporarily set border-radius: 20px. */}
        <div className="webchat__modal-dialog__close-button-layout">
          <button
            aria-label={closeButtonAlt}
            className="webchat__modal-dialog__close-button"
            onClick={handleCloseButtonClick}
            type="button"
          >
            <div className="webchat__modal-dialog__close-button-border">
              <svg
                className="webchat__modal-dialog__close-button-image"
                // "focusable" attribute is only available in IE11 and "tabIndex={-1}" does not work.
                focusable={false}
                role="presentation"
                viewBox="0 0 2048 2048"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2048 136l-888 888 888 888-136 136-888-888-888 888L0 1912l888-888L0 136 136 0l888 888L1912 0l136 136z" />
              </svg>
            </div>
          </button>
        </div>
        <div className="webchat__modal-dialog__body">{children}</div>
      </div>
    </dialog>
  );
});

ModalDialog.displayName = 'ModalDialog';

export default ModalDialog;
