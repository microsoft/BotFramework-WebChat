import React from 'react';
import SayAlt from './SayAlt';
import Say from 'react-say';

import connectToWebChat from '../connectToWebChat';

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
    markAsSpoken: () => {
      markActivity(activity, 'speak', false)
    },
    selectVoice: voices => {
      return (
        [].find.call(voices, voice => voice.lang === activity.locale)
        || [].find.call(voices, voice => voice.lang === language)
        || [].find.call(voices, voice => voice.lang === window.navigator.language)
        || [].find.call(voices, voice => voice.lang === 'en-US')
        || voices[0]
      );
    }
  }),
  ...selectors
);

export default connectSpeakActivity(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    activity,
    markAsSpoken,
    selectVoice,
    styleSet
  }) => {
    if (!activity) {
      return false;
    }

    const lines = [activity.speak || activity.text];

    (activity.attachments || []).forEach(({ content, contentType }) => {
      switch (contentType) {
        case 'application/vnd.microsoft.card.adaptive':
          lines.push(content.speak);
          break;

        case 'application/vnd.microsoft.card.animation':
        case 'application/vnd.microsoft.card.audio':
        case 'application/vnd.microsoft.card.video':
        case 'application/vnd.microsoft.card.hero':
        case 'application/vnd.microsoft.card.thumbnail':
          lines.push(content.title);
          lines.push(content.subtitle);
          lines.push(content.text);
          break;

        case 'application/vnd.microsoft.card.receipt':
          lines.push(content.title);
          break;
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
  }
)

export { connectSpeakActivity }
