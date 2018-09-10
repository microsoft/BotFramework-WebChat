import { css } from 'glamor';
import React from 'react';

import BasicWebChat, {
  createAdaptiveCardsAttachmentMiddleware,
  createDebugAttachmentMiddleware
} from 'component';

import {
  createCognitiveServicesWebSpeechPonyfill,
  createBrowserWebSpeechPonyfill,
  createDirectLine,
  renderMarkdown
} from 'bundle';

css.global('body', {
  backgroundColor: '#EEE'
});

const ROOT_CSS = css({
  height: '100%',

  '& > div.button-bar': {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    right: 0,
    top: 0,

    '& > button': {
      backgroundColor: 'rgba(128, 128, 128, .2)',
      border: 0,
      cursor: 'pointer',
      outline: 0,
      marginBottom: 10,
      padding: '5px 10px',

      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, .2)',
        color: 'White'
      }
    }
  }
});

const WEB_CHAT_CSS = css({
  height: '100%',
  margin: '0 auto',
  maxWidth: 768
});

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.handleCollapseTimestampChange = this.handleCollapseTimestampChange.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleSendTypingChange = this.handleSendTypingChange.bind(this);
    this.handleUseEmulatorCoreClick = this.handleUseEmulatorCoreClick.bind(this);
    this.handleUseMockBot = this.handleUseMockBot.bind(this);

    this.mainRef = React.createRef();
    this.attachmentMiddleware = [
      createAdaptiveCardsAttachmentMiddleware(),
      createDebugAttachmentMiddleware()
    ];

    const params = new URLSearchParams(window.location.search);
    const directLineToken = params.get('t');
    const domain = params.get('domain');
    const speech = params.get('speech');
    const webSocket = params.get('websocket');

    if (speech === 'cs') {
      this.webSpeechPonyfillFactory = createCognitiveServicesWebSpeechPonyfill(
        fetch('https://webchat-mockbot.azurewebsites.net/speech/token', { method: 'POST' }).then(res => res.json()).then(({ token }) => token),
      );
    } else {
      this.webSpeechPonyfillFactory = createBrowserWebSpeechPonyfill();
    }

    this.state = {
      collapseTimestamp: window.sessionStorage.getItem('PLAYGROUND_COLLAPSE_TIMESTAMP'),
      directLine: createDirectLine({
        domain,
        fetch,
        token: directLineToken,
        webSocket: webSocket === 'true' || +webSocket
      }),
      language: window.sessionStorage.getItem('PLAYGROUND_LANGUAGE') || '',
      sendTyping: true
    };
  }

  componentDidMount() {
    // HACK: Focus send box should be done using context/composer
    const { current } = this.mainRef;
    const sendBox = current && current.querySelector('input[type="text"]');

    sendBox && sendBox.focus();
  }

  handleCollapseTimestampChange({ target: { value } }) {
    this.setState(() => ({
      collapseTimestamp: value === 'default' ? undefined : value === 'false' ? false : +value
    }), () => {
      window.sessionStorage.setItem('PLAYGROUND_COLLAPSE_TIMESTAMP', value);
    });
  }

  handleLanguageChange({ target: { value } }) {
    this.setState(() => ({ language: value }), () => {
      window.sessionStorage.setItem('PLAYGROUND_LANGUAGE', value)
    });
  }

  handleResetClick() {
    window.sessionStorage.removeItem('REDUX_STORE');
    window.location.reload();
  }

  handleSendTypingChange({ target: { checked } }) {
    this.setState(() => ({ sendTyping: !!checked }));
  }

  handleUseEmulatorCoreClick() {
    window.sessionStorage.removeItem('REDUX_STORE');
    window.location.href = '?domain=http://localhost:5000/v3/directline&websocket=0';
  }

  async handleUseMockBot(url) {
    try {
      const directLineTokenRes = await fetch(`${ url }/directline/token`, { method: 'POST' });

      if (directLineTokenRes.status !== 200) {
        throw new Error(`Server returned ${ directLineTokenRes.status } while requesting for Direct Line token`);
      }

      const { token } = await directLineTokenRes.json();

      window.sessionStorage.removeItem('REDUX_STORE');
      window.location.href = `?speech=cs&websocket=true&t=${ encodeURIComponent(token) }`;
    } catch (err) {
      console.log(err);
      alert('Failed to get Direct Line token for official MockBot');
    }
  }

  render() {
    const { state } = this;

    console.log(state);

    return (
      <div
        className={ ROOT_CSS }
        ref={ this.mainRef }
      >
        <BasicWebChat
          attachmentMiddleware={ this.attachmentMiddleware }
          className={ WEB_CHAT_CSS }
          collapseTimestamp={ state.collapseTimestamp }
          directLine={ state.directLine }
          locale={ state.language }
          renderMarkdown={ renderMarkdown }
          sendTyping={ state.sendTyping }
          userID="default-user"
          username="User 1"
          webSpeechPonyfillFactory={ this.webSpeechPonyfillFactory }
        />
        <div className="button-bar">
          <button
            onClick={ this.handleResetClick }
            type="button"
          >
            Remove history <small>(CTRL-R)</small>
          </button>
          <button
            onClick={ this.handleUseMockBot.bind(this, 'https://webchat-mockbot.azurewebsites.net') }
            type="button"
          >
            Start conversation with official MockBot
          </button>
          <button
            onClick={ this.handleUseEmulatorCoreClick }
            type="button"
          >
            Start conversation with Emulator Core
          </button>
          <button
            onClick={ this.handleUseMockBot.bind(this, 'http://localhost:3978') }
            type="button"
          >
            Start conversation with local MockBot
          </button>
          <div>
            <label>
              <input checked={ true } disabled={ true } type="checkbox" />
              Reliable connection
            </label>
          </div>
          <div>
            <label>
              Language
              <select
                onChange={ this.handleLanguageChange }
                value={ state.language }
              >
                <option>Default ({ window.navigator.language })</option>
                <option value="en-US">English (United States)</option>
                <option value="ja-JP">Japanese</option>
                <option value="zh-HK">Chinese (Hong Kong)</option>
                <option value="zh-YUE">Chinese (Hong Kong, Yue)</option>
                <option value="zh-TW">Chinese (Taiwan)</option>
                <option value="zh-HANT">Chinese (Traditional Chinese)</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              <input
                checked={ state.sendTyping }
                onChange={ this.handleSendTypingChange }
                type="checkbox"
              />
              Send typing
            </label>
          </div>
          <div>
            <label>
              Collapse timestamp
              <select
                onChange={ this.handleCollapseTimestampChange }
                value={ state.collapseTimestamp }
              >
                <option value="default">Default</option>
                <option value="false">Don't collapse</option>
                <option value="1000">1 second</option>
                <option value="10000">10 seconds</option>
                <option value="60000">One minute</option>
                <option value="300000">5 minutes</option>
                <option value="3600000">One hour</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    );
  }
}
