import { Constants } from 'botframework-webchat-core';
import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { FC } from 'react';

import DictationInterims from './SendBox/DictationInterims';
import MicrophoneButton from './SendBox/MicrophoneButton';
import SendButton from './SendBox/SendButton';
import SuggestedActions from './SendBox/SuggestedActions';
import TextBox from './SendBox/TextBox';
import UploadButton from './SendBox/UploadButton';
import useErrorMessageId from './providers/internal/SendBox/useErrorMessageId';
import useStyleSet from './hooks/useStyleSet';
import useStyleToEmotionObject from './hooks/internal/useStyleToEmotionObject';
import useWebSpeechPonyfill from './hooks/useWebSpeechPonyfill';

import type { WebChatActivity } from 'botframework-webchat-core';

const {
  DictateState: { DICTATING, STARTING }
} = Constants;

const { useActivities, useDirection, useDictateState, useStyleOptions } = hooks;

const ROOT_STYLE = {
  '&.webchat__send-box': {
    '& .webchat__send-box__button': { flexShrink: 0 },
    '& .webchat__send-box__dictation-interims': { flex: 10000 },
    '& .webchat__send-box__main': { display: 'flex' },
    '& .webchat__send-box__microphone-button': { flex: 1 },
    '& .webchat__send-box__text-box': { flex: 10000 }
  }
};

// TODO: [P3] We should consider exposing core/src/definitions and use it instead
function activityIsSpeakingOrQueuedToSpeak(activity: WebChatActivity) {
  return activity.type === 'message' && activity.channelData?.speak;
}

function useSendBoxSpeechInterimsVisible(): [boolean] {
  const [activities] = useActivities();
  const [dictateState] = useDictateState();

  return [
    (dictateState === STARTING || dictateState === DICTATING) &&
      !activities.filter(activityIsSpeakingOrQueuedToSpeak).length
  ];
}

type BasicSendBoxProps = {
  className?: string;
};

const BasicSendBox: FC<BasicSendBoxProps> = ({ className }) => {
  const [{ hideUploadButton, sendBoxButtonAlignment }] = useStyleOptions();
  const [{ sendBox: sendBoxStyleSet }] = useStyleSet();
  const [{ SpeechRecognition = undefined } = {}] = useWebSpeechPonyfill();
  const [direction] = useDirection();
  const [errorMessageId] = useErrorMessageId();
  const [speechInterimsVisible] = useSendBoxSpeechInterimsVisible();
  const styleToEmotionObject = useStyleToEmotionObject();

  const rootClassName = styleToEmotionObject(ROOT_STYLE) + '';

  const supportSpeechRecognition = !!SpeechRecognition;

  const buttonClassName = classNames('webchat__send-box__button', {
    'webchat__send-box__button--align-bottom': sendBoxButtonAlignment === 'bottom',
    'webchat__send-box__button--align-stretch': sendBoxButtonAlignment !== 'bottom' && sendBoxButtonAlignment !== 'top',
    'webchat__send-box__button--align-top': sendBoxButtonAlignment === 'top'
  });

  return (
    <div
      aria-errormessage={errorMessageId}
      aria-invalid={!!errorMessageId}
      className={classNames('webchat__send-box', sendBoxStyleSet + '', rootClassName + '', (className || '') + '')}
      dir={direction}
      role="form"
    >
      <SuggestedActions />
      <div className="webchat__send-box__main">
        {!hideUploadButton && <UploadButton className={buttonClassName} />}
        {speechInterimsVisible ? (
          <DictationInterims className="webchat__send-box__dictation-interims" />
        ) : (
          <TextBox className="webchat__send-box__text-box" />
        )}
        {supportSpeechRecognition ? (
          <MicrophoneButton className={classNames(buttonClassName, 'webchat__send-box__microphone-button')} />
        ) : (
          <SendButton className={buttonClassName} />
        )}
      </div>
    </div>
  );
};

BasicSendBox.defaultProps = {
  className: ''
};

BasicSendBox.propTypes = {
  className: PropTypes.string
};

export default BasicSendBox;

export { useSendBoxSpeechInterimsVisible };
