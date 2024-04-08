import React, { type ChangeEventHandler, type ReactNode, useCallback, useRef } from 'react';
import { hooks } from 'botframework-webchat-api';
import { ToolbarButton } from './Toolbar';
import { AttachmentIcon } from '../../icons/AttachmentIcon';
import { useStyles } from '../../styles';

const { useLocalizer } = hooks;

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

export default function AddAttachmentButton(
  props: Readonly<{
    disabled?: boolean | undefined;
    icon?: ReactNode | undefined;
    onFilesAdded: ((files: File[]) => void) | undefined;
  }>
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const classNames = useStyles(styles);
  const localize = useLocalizer();

  const handleClick = useCallback(() => inputRef.current?.click(), [inputRef]);

  const handleFileChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ target: { files } }) => {
      if (files) {
        props.onFilesAdded?.([...files]);
      }

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [inputRef]
  );

  return (
    <div className={classNames['webchat-fluent__sendbox__add-attachment']}>
      <input
        aria-disabled={props.disabled}
        aria-hidden="true"
        className={classNames['webchat-fluent__sendbox__add-attachment-input']}
        multiple={true}
        onInput={props.disabled ? undefined : handleFileChange}
        readOnly={props.disabled}
        ref={inputRef}
        role="button"
        tabIndex={-1}
        type="file"
      />
      <ToolbarButton aria-label={localize('TEXT_INPUT_UPLOAD_BUTTON_ALT')} onClick={handleClick}>
        {props.icon ?? <AttachmentIcon />}
      </ToolbarButton>
    </div>
  );
}
