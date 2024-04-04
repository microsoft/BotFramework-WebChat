import React, { type MouseEventHandler, useCallback, useRef, useState } from 'react';
import cx from 'classnames';
import { hooks } from 'botframework-webchat-api';
import type { DirectLineCardAction, WebChatActivity } from 'botframework-webchat-core';
import { SendIcon } from '../../icons/SendIcon';
import { ToolbarButton, ToolbarSeparator, Toolbar } from './Toolbar';
import { SuggestedActions } from './SuggestedActions';
import { AddAttachmentButton, AttachmentDropzone, Attachments } from './Attachments';
import { TextArea } from './TextArea';
import { DialpadIcon } from '../../icons/DialpadIcon';
import { useStyles } from '../../styles';

const { useLocalizer } = hooks;

const styles = {
  webchat__sendbox__root: {
    fontFamily: 'var(--fontFamilyBase)',
    color: 'var(--colorNeutralForeground1)',
    textRendering: 'optimizeLegibility'
  },

  webchat__sendbox__sendbox: {
    fontFamily: 'var(--fontFamilyBase)',
    padding: '8px',
    borderRadius: 'var(--borderRadiusLarge)',
    border: '1px solid var(--colorNeutralStroke1)',
    display: 'grid',
    gridTemplateAreas: ``,
    position: 'relative',
    gap: '6px',
    fontSize: '14px',
    lineHeight: '20px',
    backgroundColor: 'var(--colorNeutralBackground1)',

    '&:focus-within': {
      borderColor: 'var(--colorNeutralStroke1Selected)',
      boxShadow: 'inset 0 -6px 0 -3px var(--colorCompoundBrandForeground2)'
    }
  },

  'webchat__sendbox__sendbox-text': {
    fontSize: '14px',
    lineHeight: '20px',
    padding: '4px 4px 0',
    flex: 'auto',
    outline: 'none',
    border: 'none',
    resize: 'none',
    backgroundColor: 'transparent',
    fontFamily: 'var(--fontFamilyBase)'
  },

  'webchat__sendbox__sendbox-controls': {
    display: 'flex',
    paddingInlineStart: '4px',
    alignItems: 'center'
  },

  'webchat__sendbox__text-counter': {
    color: 'var(--colorNeutralForeground4)',
    fontFamily: 'var(--fontFamilyNumeric)',
    fontSize: '10px',
    lineHeight: '14px',
    cursor: 'default'
  },

  'webchat__sendbox__text-counter--error': {
    color: 'var(--colorStatusDangerForeground1)'
  }
};

export function Sendbox(props: {
  readonly className?: string | undefined;
  readonly placeholder?: string | undefined;
  readonly maxMessageLength?: number | undefined;
  readonly suggestedActions?: Partial<DirectLineCardAction>[] | undefined;
  readonly errorMessageId?: string | undefined;
  readonly onPostMessage?: ((activity: Partial<WebChatActivity>) => void) | undefined;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const isMessageLengthExceeded = !!props.maxMessageLength && message.length > props.maxMessageLength;
  const classnames = useStyles(styles);
  const localize = useLocalizer();

  const handleReplyClick = useCallback((action: Partial<DirectLineCardAction>) => {
    if ('displayText' in action) {
      props.onPostMessage?.({ text: action.displayText });
    }
  }, []);

  const handleSendboxClick = useCallback<MouseEventHandler>(event => {
    if ('tabIndex' in event.target && typeof event.target.tabIndex === 'number' && event.target.tabIndex >= 0) {
      return;
    }
    inputRef.current?.focus();
  }, []);

  const handleMessageChange: React.FormEventHandler<HTMLTextAreaElement> = useCallback(ev => {
    setMessage(ev.currentTarget.value);
  }, []);

  const handleAddFiles = useCallback((inputFiles: File[]) => {
    setFiles(files => files.concat(inputFiles));
  }, []);

  const handleSendClick = useCallback(() => {
    props.onPostMessage?.({
      text: message,
      attachments: files.map(file => ({
        contentType: file.type,
        name: file.name
      }))
    });
    setMessage('');
    setFiles([]);
  }, [props, message, files]);

  const aria = {
    role: 'form',
    'aria-invalid': 'false' as const,
    ...(props.errorMessageId && {
      'aria-invalid': 'true' as const,
      'aria-errormessage': props.errorMessageId
    })
  };

  return (
    <div className={cx(classnames.webchat__sendbox__root, props.className)} {...aria}>
      {props.suggestedActions && (
        <SuggestedActions onActionClick={handleReplyClick} suggestedActions={props.suggestedActions} />
      )}
      <div className={cx(classnames.webchat__sendbox__sendbox)} onClickCapture={handleSendboxClick}>
        <TextArea
          className={cx(classnames['webchat__sendbox__sendbox-text'])}
          onInput={handleMessageChange}
          placeholder={props.placeholder ?? localize('TEXT_INPUT_PLACEHOLDER')}
          ref={inputRef}
          value={message}
        />
        <Attachments files={files} />
        <div className={cx(classnames['webchat__sendbox__sendbox-controls'])}>
          {props.maxMessageLength && (
            <div
              className={cx(classnames['webchat__sendbox__text-counter'], {
                [classnames['webchat__sendbox__text-counter--error']]: isMessageLengthExceeded
              })}
            >
              {`${message.length}/${props.maxMessageLength}`}
            </div>
          )}
          <Toolbar>
            <ToolbarButton aria-label={localize('TEXT_INPUT_DIALPAD_BUTTON_ALT')}>
              <DialpadIcon />
            </ToolbarButton>
            <AddAttachmentButton onFilesAdded={handleAddFiles} />
            <ToolbarSeparator />
            <ToolbarButton
              aria-label={localize('TEXT_INPUT_SEND_BUTTON_ALT')}
              disabled={isMessageLengthExceeded}
              onClick={handleSendClick}
            >
              <SendIcon />
            </ToolbarButton>
          </Toolbar>
        </div>
        <AttachmentDropzone onFilesAdded={handleAddFiles} />
      </div>
    </div>
  );
}
