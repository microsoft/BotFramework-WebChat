import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Checkbox, Dropdown, initializeIcons, Stack } from '@fluentui/react';

import ReactWebChat, { createDirectLine } from 'botframework-webchat';
import { createStoreWithDevTools } from 'botframework-webchat-core';
import './App.css';

function App() {
  initializeIcons(); // @fluentui icons
  const stackTokens = { childrenGap: 10 };
  const REDUX_STORE_KEY = 'REDUX_STORE';

  const mainRef = useRef();
  const [dir, setDirUI] = useState(() => window.sessionStorage.getItem('PLAYGROUND_DIRECTION') || 'auto');

  const [hideSendBox, setHideSendBox] = useState(false);

  const [locale, setLocale] = useState(
    () => window.sessionStorage.getItem('PLAYGROUND_LANGUAGE') || window.navigator.language
  );

  const [sendTimeout, setSendTimeout] = useState(
    () => window.sessionStorage.getItem('PLAYGROUND_SEND_TIMEOUT') || 20000
  );

  const [sendTypingIndicator, setSendTypingIndicator] = useState(false);

  const [uiDisabled, setDisabledUI] = useState(false);

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
        // eslint-disable-next-line
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
    // eslint-disable-next-line
    console.log('Playground: Started conversation with Official MockBot');
  }, [handleUseMockBot]);

  const handleStartConversationWithLocalMockBot = useCallback(() => {
    handleUseMockBot('http://localhost:3978');

    // TODO: Change to TOAST
    // eslint-disable-next-line
    console.log('Playground: Started conversation with locally running MockBot');
  }, [handleUseMockBot]);

  /// END CONNECTIVITY

  /*
  /// Web Chat props
  */

  const handleDirChange = useCallback(
    (e, { key }) => {
      setDirUI(key);
      window.sessionStorage.setItem('PLAYGROUND_DIRECTION', key);
    },
    [setDirUI]
  );

  const handleLocaleChange = useCallback(
    (e, { key }) => {
      setLocale(key);
      document.querySelector('html').setAttribute('lang', key || window.navigator.language);
      window.sessionStorage.setItem('PLAYGROUND_LANGUAGE', key);
    },
    [setLocale]
  );

  const handleSendTypingIndicatorChange = useCallback(
    (e, checked) => {
      console.log(checked);
      setSendTypingIndicator(!!checked);
    },
    [setSendTypingIndicator]
  );

  const handleUIDisabledChange = useCallback(
    (e, checked) => {
      setDisabledUI(!!checked);
    },
    [setDisabledUI]
  );

  /// END Web Chat props

  /*
  /// Style Options
  */

  const handleHideSendBoxChange = useCallback(
    ({ target: { checked } }) => {
      setHideSendBox(!!checked);
    },
    [setHideSendBox]
  );

  const handleSendTimeoutChange = useCallback(
    (e, { key }) => {
      setSendTimeout(key);
      window.sessionStorage.setItem('PLAYGROUND_SEND_TIMEOUT', key);
    },
    [setSendTimeout]
  );

  /// END Style Options

  useEffect(() => {
    const { current } = mainRef;
    const sendBox = current && current.querySelector('input[type="text"]');

    sendBox && sendBox.focus();
    handleStartConversationWithOfficialMockBot();
  }, [handleStartConversationWithOfficialMockBot]);

  const directLine = useMemo(() => createDirectLine({ token }), [token]);

  const dirOptions = [
    { key: 'auto', text: 'Default (auto)' },
    { key: 'ltr', text: 'Left to Right' },
    { key: 'rtl', text: 'Right to left' }
  ];

  const localeOptions = [
    { key: '', text: `Default: ${window.navigator.language}` },
    { key: 'ar-SA', text: 'Arabic (Saudi Arabia)' },
    { key: 'eu-ES', text: 'Basque' },
    { key: 'bg-BG', text: 'Bulgarian' },
    { key: 'ca-ES', text: 'Catalan' },
    { key: 'yue', text: 'Cantonese' },
    { key: 'zh-Hans', text: 'Chinese (Simplified)' },
    { key: 'zh-Hant', text: 'Chinese (Traditional)' },
    { key: 'hr-HR', text: 'Croatian' },
    { key: 'cs-CZ', text: 'Czech' },
    { key: 'da-DK', text: 'Danish' },
    { key: 'nl-NL', text: 'Dutch' },
    { key: 'ar-EG', text: 'Egyptian Arabic' },
    { key: 'en-US', text: 'English' },
    { key: 'et-EE', text: 'Estonian' },
    { key: 'fi-FI', text: 'Finnish' },
    { key: 'fr-FR', text: 'French' },
    { key: 'gl-ES', text: 'Galician' },
    { key: 'de-DE', text: 'German' },
    { key: 'el-GR', text: 'Greek' },
    { key: 'he-IL', text: 'Hebrew' },
    { key: 'hi-IN', text: 'Hindi' },
    { key: 'hu-HU', text: 'Hungarian' },
    { key: 'id-ID', text: 'Indonesian' },
    { key: 'it-IT', text: 'Italian' },
    { key: 'ja-JP', text: 'Japanese' },
    { key: 'ar-JO', text: 'Jordanian Arabic' },
    { key: 'kk-KZ', text: 'Kazakh' },
    { key: 'ko-kr', text: 'Korean' },
    { key: 'lv-LV', text: 'Latvian' },
    { key: 'lt-LT', text: 'Lithuanian' },
    { key: 'ms-MY', text: 'Malay' },
    { key: 'nb-NO', text: 'Norwegian (Bokmål)' },
    { key: 'pl-PL', text: 'Polish' },
    { key: 'pt-BR', text: 'Portuguese (Brazil)' },
    { key: 'pt-PT', text: 'Portuguese (Portugal)' },
    { key: 'ro-RO', text: 'Romanian' },
    { key: 'ru-RU', text: 'Russian' },
    { key: 'sr-Cyrl', text: 'Serbian (Cyrillic)' },
    { key: 'sr-Latn', text: 'Serbian (Latin)' },
    { key: 'sk-SK', text: 'Slovak' },
    { key: 'sl-SI', text: 'Slovenian' },
    { key: 'es-ES', text: 'Spanish' },
    { key: 'sv-SE', text: 'Swedish' },
    { key: 'th-TH', text: 'Thai' },
    { key: 'tr-TR', text: 'Turkish' },
    { key: 'uk-UA', text: 'Ukrainian' },
    { key: 'vi-VN', text: 'Vietnamese' }
  ];

  const sendTimeoutOptions = [
    { key: '1000', text: '1 second' },
    { key: '2000', text: '2 seconds' },
    { key: '5000', text: '5 seconds' },
    { key: '20000', text: '20 seconds (Default)' },
    { key: '60000', text: '1 minute' },
    { key: '120000', text: '2 minutes' },
    { key: '300000', text: '5 minutes (> browser timeout)' }
  ];

  const styleOptions = {
    hideSendBox: hideSendBox,
    sendTimeout: +sendTimeout
  };

  return (
    <div id="app-container" ref={mainRef}>
      <ReactWebChat
        className="webchat"
        dir={dir}
        directLine={directLine}
        disabled={uiDisabled}
        locale={locale}
        sendTypingIndicator={sendTypingIndicator}
        store={store}
        styleOptions={styleOptions}
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
          <Stack tokens={stackTokens}>
            <Dropdown label="Direction" onChange={handleDirChange} options={dirOptions} selectedKey={dir} />

            <Dropdown label="Locale" onChange={handleLocaleChange} options={localeOptions} selectedKey={locale} />

            {/* info icon: Send 'echo-typing' to the bot to turn this feature on and off */}
            <Checkbox
              label="Send typing indicator"
              checked={sendTypingIndicator}
              onChange={handleSendTypingIndicatorChange}
            />

            <Checkbox label="Disable UI" checked={uiDisabled} onChange={handleUIDisabledChange} />
          </Stack>
        </fieldset>
        <Stack tokens={stackTokens}>
          <Checkbox label="Hide SendBox" checked={hideSendBox} onChange={handleHideSendBoxChange} />
          {/* info icon: Turn on airplane mode to test this feature */}
          <Dropdown
            label="Send timeout"
            onChange={handleSendTimeoutChange}
            options={sendTimeoutOptions}
            selectedKey={sendTimeout}
          />
        </Stack>
      </div>
    </div>
  );
}

export default App;
