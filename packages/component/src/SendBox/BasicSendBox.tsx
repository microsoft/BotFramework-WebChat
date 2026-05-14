import { SendBoxToolbarMiddlewareProxy, hooks } from 'botframework-webchat-api';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { Constants } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo, useCallback, type ClipboardEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
import useMakeThumbnail from '../hooks/useMakeThumbnail';
import useStyleSet from '../hooks/useStyleSet';
import useWebSpeechPonyfill from '../hooks/useWebSpeechPonyfill';
import useErrorMessageId from '../providers/internal/SendBox/useErrorMessageId';
import useSubmit from '../providers/internal/SendBox/useSubmit';
import { AttachmentBar } from './AttachmentBar/index';
import DictationInterims from './DictationInterims';
import DropZone from './DropZone';
import MicrophoneButton from './MicrophoneButton';
import SendButton from './SendButton';
import SuggestedActions from './SuggestedActions';
import TextBox from './TextBox';

const {
  DictateState: { DICTATING, STARTING }
} = Constants;

const { useDirection, useDictateState, useSendBoxAttachments, useStyleOptions, useUIState } = hooks;

const ROOT_STYLE = {
  '&.webchat__send-box': {
    display: 'grid',
    gridTemplateAreas: '"suggested-actions" "content"',
    gridTemplateRows: 'auto 1fr',

    '& .webchat__suggested-actions': {
      gridArea: 'suggested-actions',
      minWidth: '0'
    },

    '& .webchat__send-box__main': {
      gridArea: 'content',
      minWidth: '0'
    },

    '& .webchat__drop-zone': {
      gridArea: 'content',
      minWidth: '0'
    },

    '& .webchat__send-box__button': { flexShrink: 0 },
    '& .webchat__send-box__dictation-interims': { flex: 10000 },
    '& .webchat__send-box__microphone-button': { flex: 1 },
    '& .webchat__send-box__text-box': { flex: 10000 }
  }
};

function useSendBoxSpeechInterimsVisible(): [boolean] {
  const [dictateState] = useDictateState();

  return [dictateState === STARTING || dictateState === DICTATING];
}

const basicSendBoxPropsSchema = pipe(
  object({
    className: optional(string())
  }),
  readonly()
);

type BasicSendBoxProps = InferInput<typeof basicSendBoxPropsSchema>;

function BasicSendBox(props: BasicSendBoxProps) {
  const { className } = validateProps(basicSendBoxPropsSchema, props);

  const [{ disableFileUpload, sendAttachmentOn, sendBoxButtonAlignment }] = useStyleOptions();
  const [{ sendBox: sendBoxStyleSet }] = useStyleSet();
  const [{ SpeechRecognition = undefined } = {}] = useWebSpeechPonyfill();
  const [direction] = useDirection();
  const [errorMessageId] = useErrorMessageId();
  const [sendBoxAttachments, setSendBoxAttachments] = useSendBoxAttachments();
  const [speechInterimsVisible] = useSendBoxSpeechInterimsVisible();
  const [uiState] = useUIState();
  const makeThumbnail = useMakeThumbnail();
  const styleToEmotionObject = useStyleToEmotionObject();
  const submit = useSubmit();

  const rootClassName = styleToEmotionObject(ROOT_STYLE) + '';

  const disabled = uiState === 'disabled';
  const sendAttachmentOnRef = useRefFrom(sendAttachmentOn);
  const sendBoxAttachmentsRef = useRefFrom(sendBoxAttachments);

  const supportSpeechRecognition = !!SpeechRecognition;

  const handleAddFiles = useCallback(
    async (inputFiles: File[]) => {
      const newAttachments = Object.freeze(
        await Promise.all(
          inputFiles.map(file =>
            makeThumbnail(file).then(thumbnailURL =>
              Object.freeze({ blob: file, ...(thumbnailURL && { thumbnailURL }) })
            )
          )
        )
      );

      setSendBoxAttachments([...sendBoxAttachmentsRef.current, ...newAttachments]);

      sendAttachmentOnRef.current === 'attach' && submit();
    },
    [makeThumbnail, sendAttachmentOnRef, sendBoxAttachmentsRef, setSendBoxAttachments, submit]
  );

  const handlePaste = useCallback<ClipboardEventHandler>(
    event => {
      if (disableFileUpload || disabled) {
        return;
      }

      const { files } = event.clipboardData;

      if (files.length) {
        event.preventDefault();
        handleAddFiles([...files]);
      }
    },
    [disabled, disableFileUpload, handleAddFiles]
  );

  const buttonClassName = classNames('webchat__send-box__button', {
    'webchat__send-box__button--align-bottom': sendBoxButtonAlignment === 'bottom',
    'webchat__send-box__button--align-stretch': sendBoxButtonAlignment !== 'bottom' && sendBoxButtonAlignment !== 'top',
    'webchat__send-box__button--align-top': sendBoxButtonAlignment === 'top'
  });

  return (
    <div
      aria-describedby={errorMessageId}
      aria-errormessage={errorMessageId}
      aria-invalid={!!errorMessageId}
      className={classNames('webchat__send-box', sendBoxStyleSet + '', rootClassName + '', (className || '') + '')}
      dir={direction}
      onPaste={handlePaste}
      role="form"
    >
      <SuggestedActions />
      <div className="webchat__send-box__main">
        <AttachmentBar className="webchat__send-box__attachment-bar" />
        <SendBoxToolbarMiddlewareProxy className={buttonClassName} request={undefined} />
        <div className="webchat__send-box__editable">
          {speechInterimsVisible ? (
            <DictationInterims className="webchat__send-box__dictation-interims" />
          ) : (
            <TextBox className="webchat__send-box__text-box" />
          )}
        </div>
        {supportSpeechRecognition ? (
          <MicrophoneButton className={classNames(buttonClassName, 'webchat__send-box__microphone-button')} />
        ) : (
          <SendButton className={buttonClassName} />
        )}
      </div>
      {!disableFileUpload && !disabled && <DropZone onFilesAdded={handleAddFiles} />}
    </div>
  );
}

export default memo(BasicSendBox);
export { basicSendBoxPropsSchema, useSendBoxSpeechInterimsVisible, type BasicSendBoxProps };
