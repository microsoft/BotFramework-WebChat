import { hooks } from 'botframework-webchat-api';
import React, { useCallback, useRef, type ChangeEventHandler, type ReactNode, memo } from 'react';
import { useRefFrom } from 'use-ref-from';
import { AttachmentIcon } from '../../icons/AttachmentIcon';
import { useStyles } from '../../styles';
import testIds from '../../testIds';
import { ToolbarButton } from './Toolbar';

const { useLocalizer, useStyleOptions } = hooks;

const styles = {
  'webchat-fluent__sendbox__add-attachment': {
    display: 'grid'
  },

  'webchat-fluent__sendbox__add-attachment-input': {
    fontSize: 0,
    height: 0,
    width: 0
  }
};

function AddAttachmentButton(
  props: Readonly<{
    disabled?: boolean | undefined;
    icon?: ReactNode | undefined;
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
    <div className={classNames['webchat-fluent__sendbox__add-attachment']}>
      <input
        accept={uploadAccept}
        aria-disabled={props.disabled}
        aria-hidden="true"
        className={classNames['webchat-fluent__sendbox__add-attachment-input']}
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
        {props.icon ?? <AttachmentIcon />}
      </ToolbarButton>
    </div>
  );
}

export default memo(AddAttachmentButton);
