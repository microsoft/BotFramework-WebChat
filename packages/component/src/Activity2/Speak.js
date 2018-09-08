import { connect } from 'react-redux';
import React from 'react';
import SayAlt from './SayAlt';
import Say from 'react-say';

import Context from '../Context';

// TODO: Consider moving this feature into BasicActivity
//       And it has better DOM position for showing visual spoken text
class SpeakActivity extends React.Component {
  constructor(props) {
    super(props);

    this.handleEnd = this.handleEnd.bind(this);
    this.selectVoice = this.selectVoice.bind(this);
  }

  handleEnd() {
    const { props } = this;

    props.markActivity(props.activity, 'speak', false);
  }

  selectVoice(voices) {
    const { activity } = this.props;

    return (
      [].find.call(voices, voice => voice.lang === activity.locale)
      || [].find.call(voices, voice => voice.lang === window.navigator.language)
      || [].find.call(voices, voice => voice.lang === 'en-US')
      || voices[0]
    );
  }

  render() {
    const { activity } = this.props;

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
          onEnd={ this.handleEnd }
          speak={ lines.filter(line => line).join('\r\n') }
          voice={ this.selectVoice }
        />
        {
          !!this.props.styleSet.options.showSpokenText &&
            <SayAlt
              speak={ lines.filter(line => line).join('\r\n') }
              voice={ this.selectVoice }
            />
        }
      </React.Fragment>
    );
  }
}

export default connect(() => ({}))(({ activity, dispatch }) =>
  <Context.Consumer>
    { ({ markActivity, styleSet }) =>
      <SpeakActivity
        activity={ activity }
        dispatch={ dispatch }
        markActivity={ markActivity }
        styleSet={ styleSet }
      />
    }
  </Context.Consumer>
)
