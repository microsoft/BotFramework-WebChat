import './App.css';
import { Components, createDirectLine, createCognitiveServicesWebSpeechPonyfillFactory } from 'botframework-webchat';
import React, { Component } from 'react';

import CustomDictationInterims from './CustomDictationInterims';
import CustomMicrophoneButton from './CustomMicrophoneButton';
import fetchBingSpeechToken from './fetchBingSpeechToken';
import LastBotActivity from './LastBotActivity';

const { Composer } = Components;

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      directLine: null
    };
  }

  async componentDidMount() {
    const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
    const { token } = await res.json();

    this.setState(() => ({
      directLine: createDirectLine({
        token,
        webSpeechPonyfillFactory: createCognitiveServicesWebSpeechPonyfillFactory(fetchBingSpeechToken)
      })
    }));
  }

  render() {
    const {
      state: { directLine }
    } = this;

    return (
      !!directLine &&
        <Composer
          directLine={ directLine }
        >
          <div className="App">
            <header className="App-header">
              <CustomMicrophoneButton className="App-speech-button" />
              <CustomDictationInterims className="App-speech-interims" />
              <LastBotActivity className="App-bot-activity" />
            </header>
          </div>
        </Composer>
    );
  }
}
