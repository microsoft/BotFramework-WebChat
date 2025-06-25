import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo, type PropsWithChildren, useCallback, useLayoutEffect, useRef } from 'react';

import { ComponentIcon } from '../../../Icon';
import useStyleSet from '../../../hooks/useStyleSet';

const { useLocalizer } = hooks;

type Props = Readonly<
  PropsWithChildren<{
    'aria-label'?: string;
    'aria-labelledby'?: string;
    className?: string;
    onDismiss?: () => void;
  }>
>;

const ModalDialog = memo(
  ({ 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, children, className, onDismiss }: Props) => {
    const [{ modalDialog: modalDialogStyleSet }] = useStyleSet();
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
        className={classNames('webchat__modal-dialog', className, modalDialogStyleSet + '')}
        onClose={onDismiss}
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
              <ComponentIcon appearance="text" className="webchat__modal-dialog__close-button-icon" icon="dismiss" />
            </button>
          </div>
          <div className="webchat__modal-dialog__body">{children}</div>
        </div>
      </dialog>
    );
  }
);

ModalDialog.displayName = 'ModalDialog';

export default ModalDialog;
