import './App.css';
import {
  Components,
  createDirectLine,
  createCognitiveServicesSpeechServicesPonyfillFactory
} from 'botframework-webchat';
import React, { Component } from 'react';

import CustomDictationInterims from './CustomDictationInterims';
import CustomMicrophoneButton from './CustomMicrophoneButton';
import fetchSpeechServicesToken from './fetchSpeechServicesToken';
import LastBotActivity from './LastBotActivity';

const { Composer } = Components;

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      directLine: null,
      webSpeechPonyfillFactory: null
    };
  }

  async componentDidMount() {
    const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
    const { token } = await res.json();
    const webSpeechPonyfillFactory = await createCognitiveServicesSpeechServicesPonyfillFactory({
      // TODO: [P3] Fetch token should be able to return different region
      authorizationToken: fetchSpeechServicesToken,
      region: 'westus'
    });

    this.setState(() => ({
      directLine: createDirectLine({
        token
      }),
      webSpeechPonyfillFactory
    }));
  }

  render() {
    const {
      state: { directLine, webSpeechPonyfillFactory }
    } = this;

    return (
      !!directLine &&
      !!webSpeechPonyfillFactory && (
        <Composer directLine={directLine} webSpeechPonyfillFactory={webSpeechPonyfillFactory}>
          <div className="App">
            <header className="App-header">
              <CustomMicrophoneButton className="App-speech-button" />
              <CustomDictationInterims className="App-speech-interims" />
              <LastBotActivity className="App-bot-activity" />
            </header>
          </div>
        </Composer>
      )
    );
  }
}
