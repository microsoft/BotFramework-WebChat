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

const { useDirection, useDictateState, useSendBoxAttachments, useStyleOptions } = hooks;

const ROOT_STYLE = {
  '&.webchat__send-box': {
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

  const [{ disableFileUpload, sendBoxButtonAlignment }] = useStyleOptions();
  const [{ sendBox: sendBoxStyleSet }] = useStyleSet();
  const [{ SpeechRecognition = undefined } = {}] = useWebSpeechPonyfill();
  const [direction] = useDirection();
  const [errorMessageId] = useErrorMessageId();
  const [sendBoxAttachments, setSendBoxAttachments] = useSendBoxAttachments();
  const [speechInterimsVisible] = useSendBoxSpeechInterimsVisible();
  const makeThumbnail = useMakeThumbnail();
  const styleToEmotionObject = useStyleToEmotionObject();

  const rootClassName = styleToEmotionObject(ROOT_STYLE) + '';
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
    },
    [makeThumbnail, sendBoxAttachmentsRef, setSendBoxAttachments]
  );

  const handlePaste = useCallback<ClipboardEventHandler>(
    event => {
      if (disableFileUpload) {
        return;
      }

      const { files } = event.clipboardData;

      if (files.length) {
        event.preventDefault();
        handleAddFiles([...files]);
      }
    },
    [disableFileUpload, handleAddFiles]
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
      <div className="webchat__send-box__main" style={{ position: 'relative' }}>
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
        {!disableFileUpload && <DropZone onFilesAdded={handleAddFiles} />}
      </div>
    </div>
  );
}

export default memo(BasicSendBox);
export { basicSendBoxPropsSchema, useSendBoxSpeechInterimsVisible, type BasicSendBoxProps };
