import { Constants } from 'botframework-webchat-core';
import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import DictationInterims from './SendBox/DictationInterims';
import MicrophoneButton from './SendBox/MicrophoneButton';
import SendButton from './SendBox/SendButton';
import SuggestedActions from './SendBox/SuggestedActions';
import TextBox from './SendBox/TextBox';
import UploadButton from './SendBox/UploadButton';
import useActivities from './hooks/useActivities';
import useDirection from './hooks/useDirection';
import useDictateState from './hooks/useDictateState';
import useStyleOptions from './hooks/useStyleOptions';
import useStyleSet from './hooks/useStyleSet';
import useWebSpeechPonyfill from './hooks/useWebSpeechPonyfill';

const {
  DictateState: { DICTATING, STARTING }
} = Constants;

const ROOT_CSS = css({
  '& > .main': {
    display: 'flex'
  }
});

const DICTATION_INTERIMS_CSS = css({ flex: 10000 });
const MICROPHONE_BUTTON_CSS = css({ flex: 1 });
const TEXT_BOX_CSS = css({ flex: 10000 });

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

  const supportSpeechRecognition = !!SpeechRecognition;

  return (
    <div className={classNames(sendBoxStyleSet + '', ROOT_CSS + '', className + '')} dir={direction} role="form">
      <SuggestedActions />
      <div className="main">
        {!hideUploadButton && <UploadButton />}
        {speechInterimsVisible ? (
          <DictationInterims className={DICTATION_INTERIMS_CSS + ''} />
        ) : (
          <TextBox className={TEXT_BOX_CSS + ''} />
        )}
        <div>
          {supportSpeechRecognition ? <MicrophoneButton className={MICROPHONE_BUTTON_CSS + ''} /> : <SendButton />}
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
