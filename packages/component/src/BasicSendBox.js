import { Constants } from 'botframework-webchat-core';
import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import DictationInterims from './SendBox/DictationInterims';
import MicrophoneButton from './SendBox/MicrophoneButton';
import SendButton from './SendBox/SendButton';
import SuggestedActions from './SendBox/SuggestedActions';
import TextBox from './SendBox/TextBox';
import UploadButton from './SendBox/UploadButton';
import useStyleSet from './hooks/useStyleSet';
import useStyleToEmotionObject from './hooks/internal/useStyleToEmotionObject';
import useWebSpeechPonyfill from './hooks/useWebSpeechPonyfill';

const {
  DictateState: { DICTATING, STARTING }
} = Constants;

const { useActivities, useDirection, useDictateState, useStyleOptions } = hooks;

const ROOT_STYLE = {
  '& > .main': {
    display: 'flex'
  }
};

const DICTATION_INTERIMS_STYLE = { flex: 10000 };
const MICROPHONE_BUTTON_STYLE = { flex: 1 };
const TEXT_BOX_STYLE = { flex: 10000 };

// TODO: [P3] We should consider exposing core/src/definitions and use it instead
function activityIsSpeakingOrQueuedToSpeak({ channelData: { speak } = {} }) {
  return !!speak;
}

function useSendBoxSpeechInterimsVisible() {
  const [activities] = useActivities();
  const [dictateState] = useDictateState();

  return [
    (dictateState === STARTING || dictateState === DICTATING) &&
      !activities.filter(activityIsSpeakingOrQueuedToSpeak).length
  ];
}

const BasicSendBox = ({ className }) => {
  const [{ hideUploadButton }] = useStyleOptions();
  const [{ sendBox: sendBoxStyleSet }] = useStyleSet();
  const [{ SpeechRecognition } = {}] = useWebSpeechPonyfill();
  const [direction] = useDirection();
  const [speechInterimsVisible] = useSendBoxSpeechInterimsVisible();
  const styleToEmotionObject = useStyleToEmotionObject();

  const dictationInterimsClassName = styleToEmotionObject(DICTATION_INTERIMS_STYLE) + '';
  const microphoneButtonClassName = styleToEmotionObject(MICROPHONE_BUTTON_STYLE) + '';
  const rootClassName = styleToEmotionObject(ROOT_STYLE) + '';
  const textBoxClassName = styleToEmotionObject(TEXT_BOX_STYLE) + '';

  const supportSpeechRecognition = !!SpeechRecognition;

  return (
    <div
      className={classNames(sendBoxStyleSet + '', rootClassName, (className || '') + '')}
      dir={direction}
      role="form"
    >
      <SuggestedActions />
      <div className="main">
        {!hideUploadButton && <UploadButton />}
        {speechInterimsVisible ? (
          <DictationInterims className={dictationInterimsClassName} />
        ) : (
          <TextBox className={textBoxClassName} />
        )}
        <div>
          {supportSpeechRecognition ? <MicrophoneButton className={microphoneButtonClassName} /> : <SendButton />}
        </div>
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
