import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactWebChat, { createDirectLine } from 'botframework-webchat';
import { createStoreWithDevTools } from 'botframework-webchat-core';
import './App.css';

function App() {
  const REDUX_STORE_KEY = 'REDUX_STORE';

  const mainRef = useRef();

  const [dir, setDirUI] = useState(() => window.sessionStorage.getItem('PLAYGROUND_DIRECTION') || 'auto');

  const [locale, setLocale] = useState(
    () => window.sessionStorage.getItem('PLAYGROUND_LANGUAGE') || window.navigator.language
  );

  const [sendTimeout, setSendTimeout] = useState(() => window.sessionStorage.getItem('PLAYGROUND_SEND_TIMEOUT') || '');

  const [sendTypingIndicator, setSendTypingIndicator] = useState(false);

  useEffect(() => {
    document.querySelector('html').setAttribute('lang', locale);
  }, [locale]);

  const store = useMemo(
    () =>
      createStoreWithDevTools({}, ({ dispatch }) => next => action => {
        if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
          dispatch({
            type: 'WEB_CHAT/SEND_EVENT',
            payload: {
              name: 'webchat/join',
              value: {
                language: window.navigator.language
              }
            }
          });
        }
        return next(action);
      }),
    []
  );

  store.subscribe(() => {
    sessionStorage.setItem(REDUX_STORE_KEY, JSON.stringify(store.getState()));
  });

  const [token, setToken] = useState();
  /*
  /// CONNECTIVITY
  */

  const handleUseMockBot = useCallback(
    async url => {
      try {
        const directLineTokenRes = await fetch(`${url}/directline/token`, { method: 'POST' });

        if (directLineTokenRes.status !== 200) {
          throw new Error(`Server returned ${directLineTokenRes.status} when requesting Direct Line token`);
        }

        const { token } = await directLineTokenRes.json();

        setToken(token);
      } catch (err) {
        console.log(err);

        // TODO: change to TOAST
        alert(`Failed to get Direct Line token for ${url} bot`);
      }
    },
    [setToken]
  );
  // TODO: remember if user was connected to official mock bot or local, then fetch token from that
  const handleResetClick = useCallback(() => {
    window.sessionStorage.removeItem('REDUX_STORE');
    window.location.reload();
  }, []);

  const handleStartConversationWithOfficialMockBot = useCallback(() => {
    handleUseMockBot('https://webchat-mockbot.azurewebsites.net');

    // TODO: Change to TOAST
    console.log('Playground: Started conversation with Official MockBot');
  }, [handleUseMockBot]);

  const handleStartConversationWithLocalMockBot = useCallback(() => {
    handleUseMockBot('http://localhost:3978');

    // TODO: Change to TOAST
    console.log('Playground: Started conversation with locally running MockBot');
  }, [handleUseMockBot]);

  /// END CONNECTIVITY

  /*
  /// Web Chat props
  */

  const handleDirChange = useCallback(
    ({ target: { value } }) => {
      setDirUI(value);
      window.sessionStorage.setItem('PLAYGROUND_DIRECTION', value);
    },
    [setDirUI]
  );

  const handleLanguageChange = useCallback(
    ({ target: { value } }) => {
      setLocale(value);
      document.querySelector('html').setAttribute('lang', value || window.navigator.language);
      window.sessionStorage.setItem('PLAYGROUND_LANGUAGE', value);
    },
    [setLocale]
  );

  const handleSendTimeoutChange = useCallback(
    ({ target: { value } }) => {
      setSendTimeout(value);
      window.sessionStorage.setItem('PLAYGROUND_SEND_TIMEOUT', value);
    },
    [setSendTimeout]
  );

  const handleSendTypingIndicatorChange = useCallback(
    ({ target: { checked } }) => {
      setSendTypingIndicator(!!checked);
    },
    [setSendTypingIndicator]
  );

  /// END Web Chat props

  useEffect(() => {
    const { current } = mainRef;
    const sendBox = current && current.querySelector('input[type="text"]');

    sendBox && sendBox.focus();
    handleStartConversationWithOfficialMockBot();
  }, [handleStartConversationWithOfficialMockBot]);

  const directLine = useMemo(() => createDirectLine({ token }), [token]);

  return (
    <div id="app-container" ref={mainRef}>
      <ReactWebChat
        className="webchat"
        dir={dir}
        directLine={directLine}
        locale={locale}
        sendTimeout={+sendTimeout || undefined}
        sendTypingIndicator={true}
        store={store}
      />
      <div className="button-bar">
        <fieldset>
          <legend>Connectivity</legend>
          <button onClick={handleStartConversationWithOfficialMockBot} type="button">
            Official MockBot
          </button>
          <button onClick={handleStartConversationWithLocalMockBot} type="button">
            Local MockBot
          </button>
          <button onClick={handleResetClick} title="Reconnects to Official MockBot" type="button">
            Reset session{' '}
            <small>
              (<kbd>CTRL</kbd> + <kbd>R</kbd>)
            </small>
          </button>
        </fieldset>
        <fieldset>
          <legend>Web Chat props</legend>
          <label>
            Direction:
            <select onChange={handleDirChange} value={dir}>
              <option value="auto">Default (auto)</option>
              <option value="ltr">Left to Right</option>
              <option value="rtl">Right to Left</option>
            </select>
          </label>
          <label>
            Locale:
            <select onChange={handleLanguageChange} value={locale}>
              <option value="">Default ({window.navigator.language})</option>
              <option value="ar-SA">Arabic (Saudi Arabia)</option>
              <option value="eu-ES">Basque</option>
              <option value="bg-BG">Bulgarian</option>
              <option value="ca-ES">Catalan</option>
              <option value="yue">Cantonese</option>
              <option value="zh-Hans">Chinese (Simplified)</option>
              <option value="zh-Hant">Chinese (Traditional)</option>
              <option value="hr-HR">Croatian</option>
              <option value="cs-CZ">Czech</option>
              <option value="da-DK">Danish</option>
              <option value="nl-NL">Dutch</option>
              <option value="ar-EG">Egyptian Arabic</option>
              <option value="en-US">English</option>
              <option value="et-EE">Estonian</option>
              <option value="fi-FI">Finnish</option>
              <option value="fr-FR">French</option>
              <option value="gl-ES">Galician</option>
              <option value="de-DE">German</option>
              <option value="el-GR">Greek</option>
              <option value="he-IL">Hebrew</option>
              <option value="hi-IN">Hindi</option>
              <option value="hu-HU">Hungarian</option>
              <option value="id-ID">Indonesian</option>
              <option value="it-IT">Italian</option>
              <option value="ja-JP">Japanese</option>
              <option value="ar-JO">Jordanian Arabic</option>
              <option value="kk-KZ">Kazakh</option>
              <option value="ko-kr">Korean</option>
              <option value="lv-LV">Latvian</option>
              <option value="lt-LT">Lithuanian</option>
              <option value="ms-MY">Malay</option>
              <option value="nb-NO">Norwegian (Bokmål)</option>
              <option value="pl-PL">Polish</option>
              <option value="pt-BR">Portuguese (Brazil)</option>
              <option value="pt-PT">Portuguese (Portugal)</option>
              <option value="ro-RO">Romanian</option>
              <option value="ru-RU">Russian</option>
              <option value="sr-Cyrl">Serbian (Cyrillic)</option>
              <option value="sr-Latn">Serbian (Latin)</option>
              <option value="sk-SK">Slovak</option>
              <option value="sl-SI">Slovenian</option>
              <option value="es-ES">Spanish</option>
              <option value="sv-SE">Swedish</option>
              <option value="th-TH">Thai</option>
              <option value="tr-TR">Turkish</option>
              <option value="uk-UA">Ukrainian</option>
              <option value="vi-VN">Vietnamese</option>
            </select>
          </label>
          <label title="Turn on airplane mode to test this feature">
            Send timeout:
            <select onChange={handleSendTimeoutChange} value={sendTimeout}>
              <option value="1000">1 second</option>
              <option value="2000">2 seconds</option>
              <option value="5000">5 seconds</option>
              <option defaultValue value="20000">
                20 seconds (Default)
              </option>
              <option value="60000">1 minute</option>
              <option value="120000">2 minutes</option>
              <option value="300000">5 minutes (&gt; browser timeout)</option>
            </select>
          </label>
          <label title="Send 'echo-typing' to the bot to turn this feature on and off">
            Send typing indicator:
            <input checked={sendTypingIndicator} onChange={handleSendTypingIndicatorChange} type="checkbox" unchecked />
          </label>
        </fieldset>
      </div>
    </div>
  );
}

export default App;
