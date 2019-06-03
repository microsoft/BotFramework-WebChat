import { css } from 'glamor';
import React from 'react';
import memoize from 'memoize-one';

import ReactWebChat, {
  createBrowserWebSpeechPonyfillFactory,
  createCognitiveServicesBingSpeechPonyfillFactory,
  createCognitiveServicesSpeechServicesPonyfillFactory,
  renderMarkdown
} from 'botframework-webchat';

import createDevModeActivityMiddleware from './createDevModeActivityMiddleware';
import createDevModeAttachmentMiddleware from './createDevModeAttachmentMiddleware';
import createFaultyDirectLine from './createFaultyDirectLine';

css.global('body', {
  backgroundColor: '#EEE'
});

const ROOT_CSS = css({
  height: '100%',

  '& > div.button-bar': {
    backdropFilter: 'blur(2px)',
    backgroundColor: 'rgba(255, 255, 255, .8)',
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    position: 'absolute',
    right: 0,
    top: 0,

    '& > button': {
      backgroundColor: 'rgba(128, 128, 128, .2)',
      border: 0,
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

    this.handleBotAvatarInitialsChange = this.handleBotAvatarInitialsChange.bind(this);
    this.handleDisabledChange = this.handleDisabledChange.bind(this);
    this.handleDisconnectClick = this.handleDisconnectClick.bind(this);
    this.handleErrorClick = this.handleErrorClick.bind(this);
    this.handleGroupTimestampChange = this.handleGroupTimestampChange.bind(this);
    this.handleHideSendBoxChange = this.handleHideSendBoxChange.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.handleReliabilityChange = this.handleReliabilityChange.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleSendTimeoutChange = this.handleSendTimeoutChange.bind(this);
    this.handleSendTypingIndicatorChange = this.handleSendTypingIndicatorChange.bind(this);
    this.handleUseEmulatorCoreClick = this.handleUseEmulatorCoreClick.bind(this);
    this.handleUseMockBot = this.handleUseMockBot.bind(this);
    this.handleUserAvatarInitialsChange = this.handleUserAvatarInitialsChange.bind(this);

    this.mainRef = React.createRef();
    this.activityMiddleware = createDevModeActivityMiddleware();
    this.attachmentMiddleware = createDevModeAttachmentMiddleware();
    this.createMemoizedStyleOptions = memoize((hideSendBox, botAvatarInitials, userAvatarInitials) => ({
      botAvatarInitials,
      hideSendBox,
      userAvatarInitials
    }));

    const params = new URLSearchParams(window.location.search);
    const directLineToken = params.get('t');
    const domain = params.get('domain');
    const userID = params.get('u');
    const webSocket = params.get('websocket');

    document
      .querySelector('html')
      .setAttribute('lang', window.sessionStorage.getItem('PLAYGROUND_LANGUAGE') || window.navigator.language);

    this.state = {
      botAvatarInitials: 'BF',
      directLine: createFaultyDirectLine({
        domain,
        fetch,
        token: directLineToken,
        webSocket: webSocket === 'true' || !!+webSocket
      }),
      disabled: false,
      faulty: false,
      groupTimestamp: window.sessionStorage.getItem('PLAYGROUND_GROUP_TIMESTAMP'),
      hideSendBox: false,
      language: window.sessionStorage.getItem('PLAYGROUND_LANGUAGE') || '',
      sendTimeout: window.sessionStorage.getItem('PLAYGROUND_SEND_TIMEOUT') || '',
      sendTypingIndicator: true,
      userAvatarInitials: 'WC',
      userID,
      username: 'Web Chat user',
      webSpeechPonyfillFactory: undefined
    };
  }

  componentDidMount() {
    // HACK: Focus send box should be done using context/composer
    const { current } = this.mainRef;
    const sendBox = current && current.querySelector('input[type="text"]');

    sendBox && sendBox.focus();

    const speech = new URLSearchParams(window.location.search).get('speech');

    if (speech === 'bingspeech') {
      const fetchAuthorizationToken = memoize(
        () => {
          return fetch('https://webchat-mockbot.azurewebsites.net/bingspeech/token', { method: 'POST' })
            .then(res => res.json())
            .then(({ token }) => token);
        },
        (x, y) => Math.abs(x - y) < 60000
      );

      createCognitiveServicesBingSpeechPonyfillFactory({
        authorizationToken: () => fetchAuthorizationToken(Date.now())
      }).then(webSpeechPonyfillFactory => this.setState(() => ({ webSpeechPonyfillFactory })));
    } else if (speech === 'speechservices') {
      const fetchAuthorizationToken = memoize(
        () => {
          return fetch('https://webchat-mockbot.azurewebsites.net/speechservices/token', { method: 'POST' })
            .then(res => res.json())
            .then(({ token }) => token);
        },
        (x, y) => {
          return Math.abs(x - y) < 60000;
        }
      );

      createCognitiveServicesSpeechServicesPonyfillFactory({
        authorizationToken: () => fetchAuthorizationToken(Date.now()),
        region: 'westus'
      }).then(webSpeechPonyfillFactory => this.setState(() => ({ webSpeechPonyfillFactory })));
    } else {
      this.setState(() => ({ webSpeechPonyfillFactory: createBrowserWebSpeechPonyfillFactory() }));
    }
  }

  handleBotAvatarInitialsChange({ target: { value } }) {
    this.setState(() => ({ botAvatarInitials: value }));
  }

  handleDisconnectClick() {
    this.props.store.dispatch({ type: 'DIRECT_LINE/DISCONNECT' });
  }

  handleGroupTimestampChange({ target: { value } }) {
    this.setState(
      () => ({
        groupTimestamp: value
      }),
      () => {
        window.sessionStorage.setItem('PLAYGROUND_GROUP_TIMESTAMP', value);
      }
    );
  }

  handleDisabledChange({ target: { checked } }) {
    this.setState(() => ({ disabled: checked }));
  }

  handleErrorClick() {
    this.props.store.dispatch({ type: 'DIRECT_LINE/POST_ACTIVITY' });
  }

  handleHideSendBoxChange({ target: { checked } }) {
    this.setState(() => ({ hideSendBox: checked }));
  }

  handleLanguageChange({ target: { value } }) {
    this.setState(
      () => ({ language: value }),
      () => {
        document.querySelector('html').setAttribute('lang', value || window.navigator.language);
        window.sessionStorage.setItem('PLAYGROUND_LANGUAGE', value);
      }
    );
  }

  handleReliabilityChange({ target: { checked } }) {
    this.setState(() => ({ faulty: !checked }), () => this.state.directLine.setFaulty(this.state.faulty));
  }

  handleResetClick() {
    window.sessionStorage.removeItem('REDUX_STORE');
    window.location.reload();
  }

  handleSendTimeoutChange({ target: { value } }) {
    this.setState(
      () => ({ sendTimeout: value }),
      () => window.sessionStorage.setItem('PLAYGROUND_SEND_TIMEOUT', value)
    );
  }

  handleSendTypingIndicatorChange({ target: { checked } }) {
    this.setState(() => ({ sendTypingIndicator: !!checked }));
  }

  handleUseEmulatorCoreClick() {
    window.sessionStorage.removeItem('REDUX_STORE');
    window.location.href = '?domain=http://localhost:5000/v3/directline&websocket=0&u=default-user';
  }

  handleUserAvatarInitialsChange({ target: { value } }) {
    this.setState(() => ({ userAvatarInitials: value }));
  }

  async handleUseMockBot(url) {
    try {
      const directLineTokenRes = await fetch(`${url}/directline/token`, { method: 'POST' });

      if (directLineTokenRes.status !== 200) {
        throw new Error(`Server returned ${directLineTokenRes.status} while requesting for Direct Line token`);
      }

      const { token } = await directLineTokenRes.json();

      window.sessionStorage.removeItem('REDUX_STORE');
      window.location.href =
        '/?' +
        new URLSearchParams({
          speech: 'speechservices',
          websocket: 'true',
          t: token
        }).toString();
    } catch (err) {
      console.log(err);
      alert('Failed to get Direct Line token for official MockBot');
    }
  }

  render() {
    const {
      props: { store },
      state: {
        botAvatarInitials,
        directLine,
        disabled,
        faulty,
        groupTimestamp,
        hideSendBox,
        language,
        sendTimeout,
        sendTypingIndicator,
        userAvatarInitials,
        userID,
        username,
        webSpeechPonyfillFactory
      }
    } = this;
    const styleOptions = this.createMemoizedStyleOptions(hideSendBox, botAvatarInitials, userAvatarInitials);

    return (
      <div className={ROOT_CSS} ref={this.mainRef}>
        <ReactWebChat
          activityMiddleware={this.activityMiddleware}
          attachmentMiddleware={this.attachmentMiddleware}
          className={WEB_CHAT_CSS + ''}
          groupTimestamp={
            groupTimestamp === 'default' ? undefined : groupTimestamp === 'false' ? false : +groupTimestamp
          }
          directLine={directLine}
          disabled={disabled}
          locale={language}
          renderMarkdown={renderMarkdown}
          sendTimeout={+sendTimeout || undefined}
          sendTypingIndicator={sendTypingIndicator}
          store={store}
          styleOptions={styleOptions}
          userID={userID}
          username={username}
          webSpeechPonyfillFactory={webSpeechPonyfillFactory}
        />
        <div className="button-bar">
          <button onClick={this.handleResetClick} type="button">
            Remove history <small>(CTRL-R)</small>
          </button>
          <button onClick={this.handleUseMockBot.bind(this, 'https://webchat-mockbot.azurewebsites.net')} type="button">
            Start conversation with official MockBot
          </button>
          <button onClick={this.handleUseEmulatorCoreClick} type="button">
            Start conversation with Emulator Core
          </button>
          <button onClick={this.handleUseMockBot.bind(this, 'http://localhost:3978')} type="button">
            Start conversation with local MockBot
          </button>
          <button onClick={this.handleDisconnectClick} type="button">
            Disconnect
          </button>
          <button onClick={this.handleErrorClick} type="button">
            Inject error
          </button>
          <div>
            <label>
              <input checked={!faulty} onChange={this.handleReliabilityChange} type="checkbox" />
              Reliable connection
            </label>
          </div>
          <div>
            <label>
              Language
              <select onChange={this.handleLanguageChange} value={language}>
                <option value="">Default ({window.navigator.language})</option>
                <option value="zh-HK">Chinese (Hong Kong)</option>
                <option value="zh-YUE">Chinese (Hong Kong, Yue)</option>
                <option value="zh-HANS">Chinese (Simplifies Chinese)</option>
                <option value="zh-TW">Chinese (Taiwan)</option>
                <option value="zh-HANT">Chinese (Traditional Chinese)</option>
                <option value="cs-CZ">Czech (Czech Republic)</option>
                <option value="da-DK">Danish (Denmark)</option>
                <option value="nl-NL">Dutch (Netherlands)</option>
                <option value="en-US">English (United States)</option>
                <option value="de-DE">German (Germany)</option>
                <option value="el-GR">Greek (Greece)</option>
                <option value="fi-FI">Finnish (Finland)</option>
                <option value="fr-FR">French (France)</option>
                <option value="hu-HU">Hungarian (Hungary)</option>
                <option value="it-IT">Italian (Italy)</option>
                <option value="ja-JP">Japanese</option>
                <option value="ko-KR">Korean (Korea)</option>
                <option value="lv-LV">Latvian (Latvia)</option>
                <option value="nb-NO">Norwegian Bokmål (Norway)</option>
                <option value="pl-PL">Polish (Poland)</option>
                <option value="pt-BR">Portuguese (Brazil)</option>
                <option value="pt-PT">Portuguese (Portugal)</option>
                <option value="ru-RU">Russian (Russia)</option>
                <option value="es-ES">Spanish (Spain)</option>
                <option value="sv-SE">Swedish (Sweden)</option>
                <option value="tr-TR">Turkish (Turkey)</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Send timeout
              <select onChange={this.handleSendTimeoutChange} value={sendTimeout}>
                <option value="">Default (20 seconds)</option>
                <option value="1000">1 second</option>
                <option value="2000">2 seconds</option>
                <option value="5000">5 seconds</option>
                <option value="20000">20 seconds</option>
                <option value="60000">1 minute</option>
                <option value="120000">2 minutes</option>
                <option value="300000">5 minutes (&gt; browser timeout)</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              <input checked={sendTypingIndicator} onChange={this.handleSendTypingIndicatorChange} type="checkbox" />
              Send typing
            </label>
          </div>
          <div>
            <label>
              <input checked={disabled} onChange={this.handleDisabledChange} type="checkbox" />
              Disabled
            </label>
          </div>
          <div>
            <label>
              <input checked={hideSendBox} onChange={this.handleHideSendBoxChange} type="checkbox" />
              Hide send box
            </label>
          </div>
          <div>
            <label>
              Group timestamp
              <select onChange={this.handleGroupTimestampChange} value={groupTimestamp || ''}>
                <option value="default">Default</option>
                <option value="false">Don't show timestamp</option>
                <option value="0">Don't group</option>
                <option value="1000">1 second</option>
                <option value="2000">2 seconds</option>
                <option value="5000">5 seconds</option>
                <option value="10000">10 seconds</option>
                <option value="60000">One minute</option>
                <option value="300000">5 minutes</option>
                <option value="3600000">One hour</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Avatar initials
              <input
                onChange={this.handleBotAvatarInitialsChange}
                style={{ width: '4em' }}
                type="input"
                value={botAvatarInitials}
              />
              <input
                onChange={this.handleUserAvatarInitialsChange}
                style={{ width: '4em' }}
                type="input"
                value={userAvatarInitials}
              />
            </label>
          </div>
        </div>
      </div>
    );
  }
}
