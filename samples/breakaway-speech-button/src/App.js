import './App.css';
import { Components, createDirectLine, createCognitiveServicesWebSpeechPonyfillFactory } from 'botframework-webchat';
import logo from './logo.svg';
import React, { Component } from 'react';

import fetchBingSpeechToken from './fetchBingSpeechToken';

const { Composer, DictationInterims, MicrophoneButton } = Components;

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
              <MicrophoneButton className="App-speech-button">
                <img src={ logo } className="App-logo" alt="logo" />
              </MicrophoneButton>
              <DictationInterims />
              <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn React
              </a>
            </header>
          </div>
        </Composer>
    );
  }
}
