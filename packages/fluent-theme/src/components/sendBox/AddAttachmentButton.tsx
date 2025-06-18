import { hooks } from 'botframework-webchat-component';
import React, { useCallback, useRef, type ChangeEventHandler, memo } from 'react';
import { useRefFrom } from 'use-ref-from';

import { FluentIcon } from '../icon';
import testIds from '../../testIds';
import { ToolbarButton } from './Toolbar';
import styles from './AddAttachmentButton.module.css';
import { useStyles } from '../../styles';

const { useLocalizer, useStyleOptions } = hooks;

function AddAttachmentButton(
  props: Readonly<{
    disabled?: boolean | undefined;
    onFilesAdded: ((files: File[]) => void) | undefined;
  }>
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  const [{ uploadAccept, uploadMultiple }] = useStyleOptions();
  const onFilesAddedRef = useRefFrom(props.onFilesAdded);

  const handleClick = useCallback(() => inputRef.current?.click(), [inputRef]);

  const handleFileChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ target: { files } }) => {
      if (files) {
        onFilesAddedRef.current?.([...files]);

        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    },
    [inputRef, onFilesAddedRef]
  );

  return (
    <div className={classNames['sendbox__add-attachment']}>
      <input
        accept={uploadAccept}
        aria-disabled={props.disabled}
        aria-hidden="true"
        className={classNames['sendbox__add-attachment-input']}
        multiple={uploadMultiple}
        onInput={props.disabled ? undefined : handleFileChange}
        readOnly={props.disabled}
        ref={inputRef}
        role="button"
        tabIndex={-1}
        type="file"
      />
      <ToolbarButton
        aria-label={localize('TEXT_INPUT_UPLOAD_BUTTON_ALT')}
        data-testid={testIds.sendBoxUploadButton}
        onClick={handleClick}
      >
        <FluentIcon appearance="text" icon="attachment" />
      </ToolbarButton>
    </div>
  );
}

export default memo(AddAttachmentButton);
