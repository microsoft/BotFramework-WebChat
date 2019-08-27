import PropTypes from 'prop-types';
import React from 'react';
import Say from 'react-say';

import connectToWebChat from '../connectToWebChat';
import SayAlt from './SayAlt';
import useMarkActivity from '../hooks/useMarkActivity';
import useSelectVoice from '../hooks/useSelectVoice';
import useStyleSet from '../hooks/useStyleSet';

// TODO: [P4] Consider moving this feature into BasicActivity
//       And it has better DOM position for showing visual spoken text

// TODO: [P3] We should add a "spoken" or "speakState" flag to indicate whether this activity is going to speak, or spoken
const connectSpeakActivity = (...selectors) => {
  console.warn(
    'Web Chat: connectSpeakActivity() will be removed on or after 2021-09-27, please use useSpeakActivity() instead.'
  );

  return connectToWebChat(
    ({ language, markActivity, selectVoice }, { activity }) => ({
      language,
      markAsSpoken: () => markActivity(activity, 'speak', false),
      selectVoice: voices => selectVoice(voices, activity)
    }),
    ...selectors
  );
};

const useSpeakActivity = ({ activity }) => {
  const markActivity = useMarkActivity();
  const selectVoice = useSelectVoice();

  return {
    markAsSpoken: () => markActivity(activity, 'speak', false),
    selectVoice: voices => selectVoice(voices, activity)
  };
};

const Speak = ({ activity }) => {
  const { markAsSpoken, selectVoice } = useSpeakActivity();
  const styleSet = useStyleSet();

  if (!activity) {
    return false;
  }

  const { attachments = [], speak, text } = activity;
  const lines = [speak || text];

  attachments.forEach(({ content: { speak } = {}, contentType }) => {
    if (contentType === 'application/vnd.microsoft.card.adaptive') {
      lines.push(speak);
    }
  });

  const singleLine = lines.filter(line => line).join('\r\n');

  return (
    <React.Fragment>
      <Say onEnd={markAsSpoken} onError={markAsSpoken} speak={singleLine} voice={selectVoice} />
      {!!styleSet.options.showSpokenText && <SayAlt speak={singleLine} voice={selectVoice} />}
    </React.Fragment>
  );
};

Speak.propTypes = {
  activity: PropTypes.shape({
    attachments: PropTypes.arrayOf(
      PropTypes.shape({
        speak: PropTypes.string,
        subtitle: PropTypes.string,
        text: PropTypes.string,
        title: PropTypes.string
      })
    ),
    speak: PropTypes.string,
    text: PropTypes.string
  }).isRequired
};

export default Speak;

export { connectSpeakActivity, useSpeakActivity };
