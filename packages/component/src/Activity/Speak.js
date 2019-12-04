import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import Say, { SayUtterance } from 'react-say';

import connectToWebChat from '../connectToWebChat';
import SayAlt from './SayAlt';
import useMarkActivityAsSpoken from '../hooks/useMarkActivityAsSpoken';
import useStyleOptions from '../hooks/useStyleOptions';
import useVoiceSelector from '../hooks/useVoiceSelector';

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

const Speak = ({ activity }) => {
  const [{ showSpokenText }] = useStyleOptions();
  const markActivityAsSpoken = useMarkActivityAsSpoken();
  const selectVoice = useVoiceSelector(activity);

  const markAsSpoken = useCallback(() => {
    markActivityAsSpoken(activity);
  }, [activity, markActivityAsSpoken]);

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

  const { channelData: { speechSynthesisUtterance } = {} } = activity;

  return (
    !!activity && (
      <React.Fragment>
        {speechSynthesisUtterance ? (
          <SayUtterance onEnd={markAsSpoken} onError={markAsSpoken} utterance={speechSynthesisUtterance} />
        ) : (
          <Say onEnd={markAsSpoken} onError={markAsSpoken} text={singleLine} voice={selectVoice} />
        )}
        {!!showSpokenText && <SayAlt speak={singleLine} voice={selectVoice} />}
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
    channelData: PropTypes.shape({
      speechSynthesisUtterance: PropTypes.any
    }),
    speak: PropTypes.string,
    text: PropTypes.string
  }).isRequired
};

export default Speak;

export { connectSpeakActivity };
