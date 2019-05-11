import PropTypes from 'prop-types';
import React from 'react';
import Say from 'react-say';

import connectToWebChat from '../connectToWebChat';
import SayAlt from './SayAlt';

// TODO: [P4] Consider moving this feature into BasicActivity
//       And it has better DOM position for showing visual spoken text

// TODO: [P3] We should add a "spoken" or "speakState" flag to indicate whether this activity is going to speak, or spoken
const connectSpeakActivity = (...selectors) => connectToWebChat(
  ({
    language,
    markActivity
  }, {
    activity
  }) => ({
    language,
    markAsSpoken: () => markActivity(activity, 'speak', false),
    selectVoice: voices =>
      [].find.call(voices, ({ lang }) => lang === activity.locale)
      || [].find.call(voices, ({ lang }) => lang === language)
      || [].find.call(voices, ({ lang }) => lang === window.navigator.language)
      || [].find.call(voices, ({ lang }) => lang === 'en-US')
      || voices[0]
  }),
  ...selectors
);

const Speak = ({
  activity,
  markAsSpoken,
  selectVoice,
  styleSet
}) => {
  if (!activity) {
    return false;
  }

  const {
    attachments = [],
    speak,
    text
  } = activity;

  const lines = [speak || text];

  attachments.forEach(({
    content: {
      speak,
      subtitle,
      text,
      title
    } = {},
    contentType
  }) => {
    switch (contentType) {
      case 'application/vnd.microsoft.card.adaptive':
        lines.push(speak);
        break;

      case 'application/vnd.microsoft.card.animation':
      case 'application/vnd.microsoft.card.audio':
      case 'application/vnd.microsoft.card.video':
      case 'application/vnd.microsoft.card.hero':
      case 'application/vnd.microsoft.card.thumbnail':
        lines.push(title);
        lines.push(subtitle);
        lines.push(text);
        break;

      case 'application/vnd.microsoft.card.receipt':
        lines.push(title);
        break;

      default: break;
    }
  });

  return (
    <React.Fragment>
      <Say
        onEnd={ markAsSpoken }
        speak={ lines.filter(line => line).join('\r\n') }
        voice={ selectVoice }
      />
      {
        !!styleSet.options.showSpokenText &&
          <SayAlt
            speak={ lines.filter(line => line).join('\r\n') }
            voice={ selectVoice }
          />
      }
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
  selectVoice: PropTypes.func.isRequired,
  styleSet: PropTypes.shape({
    options: PropTypes.shape({
      showSpokenText: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired
};

export default connectSpeakActivity(
  ({ styleSet }) => ({ styleSet })
)(Speak)

export { connectSpeakActivity }
