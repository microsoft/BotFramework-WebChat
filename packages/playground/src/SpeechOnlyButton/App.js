import { connect } from 'react-redux';
import { css } from 'glamor';
import * as CognitiveServices from 'web-speech-cognitive-services';
import classNames from 'classnames';
import DictateButton from 'react-dictate-button';
import React from 'react';
import Say from 'react-say';

import { postActivity } from 'botframework-webchat';

import MicrophoneIcon from './Assets/MicrophoneIcon';

const ROOT_CSS = css({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'sans-serif',
  height: '100%',
  justifyContent: 'center',

  '& > p': {
    fontSize: '200%',
  },

  '& > .from-bot': {
    bottom: 'calc(50% + 60px)',
    position: 'absolute'
  },

  '& > .transcript': {
    maxWidth: '80%',
    opacity: 1,
    position: 'absolute',
    textAlign: 'center',
    top: 'calc(50% + 60px)',
    transition: 'opacity 1s 2s',

    '&.posted': {
      opacity: 0
    }
  },

  '& > .interims': {
    '& > span:last-child': {
      opacity: .5
    }
  },

  '& .dictate-button': {
    background: '#EEE',
    border: 0,
    borderRadius: '50%',
    cursor: 'pointer',
    outline: 0,
    padding: 20,
    transition: 'background .3s',

    '& .microphone-icon': {
      height: 80,
      transition: 'fill .3s',
      width: 80
    },

    '&:hover': {
      background: '#666',
      transition: 'background 0s',

      '& .microphone-icon': {
        fill: 'White',
        transition: 'fill 0s',
      }
    }
  },

  '& > form': {
    bottom: 0,
    position: 'absolute',
    width: '100%',

    '& > input': {
      backgroundColor: '#F7F7F7',
      border: 0,
      color: '#CCC',
      fontSize: '200%',
      outline: 0,
      padding: 0,
      textAlign: 'center',
      width: '100%'
    }
  },

  '&.dictating .dictate-button': {
    background: 'Red',

    '& .microphone-icon': {
      fill: 'White'
    }
  }
});

function getLastMessage(activities) {
  const lastActivity = (activities || []).slice().reverse().find(({ type }) => type === 'message') || {};

  return lastActivity.text;
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.handleDictate = this.handleDictate.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleProgress = this.handleProgress.bind(this);
    this.handleSpeakEnd = this.handleSpeakEnd.bind(this);

    const params = new URLSearchParams(window.location.search);

    const speechKey = params.get('s') || window.localStorage.getItem('SPEECH_KEY');
    const speechToken = speechKey && new CognitiveServices.SubscriptionKey(speechKey)

    if (speechKey) {
    //   // CognitiveServices.speechSynthesis.lang = 'en-US';
      CognitiveServices.speechSynthesis.speechToken = speechToken;
    }

    this.state = {
      dictating: false,
      final: '',
      interims: [],
      posted: false,
      speechGrammarList: speechKey ? CognitiveServices.SpeechGrammarList : (window.SpeechGrammarList || window.webkitspeechGrammarList),
      speechReady: false,
      speechRecognition: speechKey ? CognitiveServices.SpeechRecognition : (window.SpeechRecognition || window.webkitSpeechRecognition),
      speechRecognitionExtra: { speechToken },
      speechSynthesis: speechKey ? CognitiveServices.speechSynthesis : (window.speechSynthesis || window.webkitSpeechSynthesis),
      speechSynthesisUtterance: speechKey ? CognitiveServices.SpeechSynthesisUtterance : (window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance),
      spoken: false,
      typeMessage: '',
      // TODO: [P3] Don't hardcode this
      voice: { voiceURI: 'Microsoft Server Speech Text to Speech Voice (en-US, JessaRUS)' }
    };
  }

  componentDidMount() {
    const { speechToken } = this.state.speechRecognitionExtra;

    speechToken && speechToken.authorized.then(() => {
      this.setState(() => ({
        speechReady: true
      }));
    });
  }

  componentWillReceiveProps(nextProps) {
    if (getLastMessage(this.props.activities) !== getLastMessage(nextProps.activities)) {
      this.setState(() => ({ spoken: false }));
    }
  }

  handleClick(event) {
    event.preventDefault();

    const { typeMessage: text } = this.state;

    text && this.props.dispatch(postActivity({
      text,
      type: 'message'
    }));

    this.setState(() => ({ typeMessage: '' }));
  }

  handleDictate({ result: { transcript: final = '' } = {} }) {
    this.setState(() => ({
      dictating: false,
      final,
      posted: false
    }), () => {
      final && this.props.dispatch(postActivity({
        text: final,
        type: 'message'
      }));

      this.setState(() => ({
        posted: true
      }));
    });
  }

  handleMessageChange({ target: { value } }) {
    this.setState(() => ({ typeMessage: value }));
  }

  handleProgress({ results = [] }) {
    this.setState(() => ({
      dictating: true,
      interims: results.map(({ transcript }) => transcript)
    }));
  }

  handleSpeakEnd() {
    this.setState(() => ({ spoken: true }));
  }

  render() {
    const { props, state } = this;
    const lastMessage = getLastMessage(props.activities);

    return (
      <div className={ classNames(ROOT_CSS + '', { dictating: state.dictating }) }>
        { !!lastMessage && !state.spoken && state.speechReady &&
          <p className="from-bot">
            <Say
              onEnd={ this.handleSpeakEnd }
              speak={ lastMessage }
              speechSynthesis={ state.speechSynthesis }
              speechSynthesisUtterance={ state.speechSynthesisUtterance }
              voice={ state.voice }
            />
            { lastMessage }
          </p>
        }
        { state.speechReady &&
          <DictateButton
            className="dictate-button"
            extra={ state.speechRecognitionExtra }
            onDictate={ this.handleDictate.bind(this) }
            onProgress={ this.handleProgress.bind(this) }
            speechGrammarList={ state.speechGrammarList }
            speechRecognition={ state.speechRecognition }
          >
            <MicrophoneIcon className="microphone-icon" />
          </DictateButton>
        }
        {
          state.dictating ?
            <p className="interims transcript">
              { state.interims.map((interim, index) => <span key={ index }>{ interim }</span>) }
            </p>
          :
            <p className={ classNames('final transcript', { posted: state.posted }) }>
              { state.final }
            </p>
        }
        <form>
          <input
            onChange={ this.handleMessageChange }
            type="text"
            value={ state.typeMessage }
          />
          <button
            hidden={ true }
            onClick={ this.handleClick }
          >
            Send
          </button>
        </form>
      </div>
    );
  }
}

export default connect(state => state)(App)
