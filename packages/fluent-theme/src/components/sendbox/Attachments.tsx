import React, { type ChangeEventHandler, type ReactNode, useCallback, useRef } from 'react';
import { hooks } from 'botframework-webchat-api';
import { ToolbarButton } from './Toolbar';
import { AttachmentIcon } from '../../icons/AttachmentIcon';
import { useStyles } from '../../styles';

const { useLocalizer } = hooks;

export const styles = {
  'webchat__sendbox__add-attachment': {
    display: 'grid'
  },

  'webchat__sendbox__add-attachment-input': {
    fontSize: 0,
    height: 0,
    width: 0
  },

  webchat__sendbox__attachment: {
    border: '1px solid var(--colorNeutralStroke1)',
    borderRadius: 'var(--borderRadiusLarge)',
    cursor: 'default',
    padding: '6px 8px',
    width: 'fit-content'
  }
};

export function AddAttachmentButton(
  props: Readonly<{
    readonly disabled?: boolean | undefined;
    readonly icon?: ReactNode | undefined;
    readonly onFilesAdded: ((files: File[]) => void) | undefined;
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
    <div className={classNames['webchat__sendbox__add-attachment']}>
      <input
        aria-disabled={props.disabled}
        aria-hidden="true"
        className={classNames['webchat__sendbox__add-attachment-input']}
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

export function Attachments({ files }: Readonly<{ readonly files: Readonly<File[]> }>) {
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  return files.length ? (
    <div className={classNames.webchat__sendbox__attachment}>
      {files.length} {localize('TEXT_INPUT_ATTACHMENTS')}
    </div>
  ) : null;
}
