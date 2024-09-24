import { SendBoxToolbarMiddlewareProxy, hooks } from 'botframework-webchat-api';
import { Constants } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { FC } from 'react';

import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';
import useStyleSet from '../hooks/useStyleSet';
import useWebSpeechPonyfill from '../hooks/useWebSpeechPonyfill';
import useErrorMessageId from '../providers/internal/SendBox/useErrorMessageId';
import DictationInterims from './DictationInterims';
import MicrophoneButton from './MicrophoneButton';
import SendButton from './SendButton';
import SuggestedActions from './SuggestedActions';
import TextBox from './TextBox';

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

type BasicSendBoxProps = Readonly<{
  className?: string;
}>;

const BasicSendBox: FC<BasicSendBoxProps> = ({ className }) => {
  const [{ sendBoxButtonAlignment }] = useStyleOptions();
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
      aria-describedby={errorMessageId}
      aria-errormessage={errorMessageId}
      aria-invalid={!!errorMessageId}
      className={classNames('webchat__send-box', sendBoxStyleSet + '', rootClassName + '', (className || '') + '')}
      dir={direction}
      role="form"
    >
      <SuggestedActions />
      <div className="webchat__send-box__main">
        <SendBoxToolbarMiddlewareProxy className={buttonClassName} request={undefined} />
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

export default BasicSendBox;

export { useSendBoxSpeechInterimsVisible };
