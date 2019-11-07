import PropTypes from 'prop-types';
import React from 'react';
import Say from 'react-say';

import connectToWebChat from '../connectToWebChat';
import SayAlt from './SayAlt';
import useStyleOptions from '../hooks/useStyleOptions';

// TODO: [P4] Consider moving this feature into BasicActivity
//       And it has better DOM position for showing visual spoken text

// TODO: [P3] We should add a "spoken" or "speakState" flag to indicate whether this activity is going to speak, or spoken
const connectSpeakActivity = (...selectors) =>
  connectToWebChat(
    ({ language, markActivity, selectVoice }, { activity }) => ({
      language,
      markAsSpoken: () => markActivity(activity, 'speak', false),
      selectVoice: voices => selectVoice(voices, activity)
    }),
    ...selectors
  );

const Speak = ({ activity, markAsSpoken, selectVoice }) => {
  const [{ showSpokenText }] = useStyleOptions();

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
      {!!showSpokenText && <SayAlt speak={singleLine} voice={selectVoice} />}
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
  }).isRequired,
  markAsSpoken: PropTypes.func.isRequired,
  selectVoice: PropTypes.func.isRequired
};

export default connectSpeakActivity()(Speak);

export { connectSpeakActivity };
