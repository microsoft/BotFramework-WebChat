import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import Say from 'react-say';

import connectToWebChat from '../connectToWebChat';
import SayAlt from './SayAlt';
import useMarkActivityAsSpoken from '../hooks/useMarkActivityAsSpoken';
import useSelectVoice from '../hooks/useSelectVoice';
import useStyleOptions from '../hooks/useStyleOptions';

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

const Speak = ({ activity }) => {
  const [{ showSpokenText }] = useStyleOptions();
  const markActivityAsSpoken = useMarkActivityAsSpoken();
  const selectVoice = useSelectVoice();

  const markAsSpoken = useCallback(() => {
    markActivityAsSpoken(activity);
  }, [activity, markActivityAsSpoken]);

  const selectVoiceWithActivity = useCallback(
    voices => {
      selectVoice(voices, activity);
    },
    [activity, selectVoice]
  );

  const singleLine = useMemo(() => {
    const { attachments = [], speak, text } = activity;

    return (
      !!activity &&
      [
        speak || text,
        ...attachments
          .filter(({ contentType }) => contentType === 'application/vnd.microsoft.card.adaptive')
          .map(({ content: { speak } = {} }) => speak)
      ]
        .filter(line => line)
        .join('\r\n')
    );
  }, [activity]);

  return (
    !!activity && (
      <React.Fragment>
        <Say onEnd={markAsSpoken} onError={markAsSpoken} speak={singleLine} voice={selectVoiceWithActivity} />
        {!!showSpokenText && <SayAlt speak={singleLine} voice={selectVoiceWithActivity} />}
      </React.Fragment>
    )
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

export { connectSpeakActivity };
