/* eslint-disable no-magic-numbers */
/* eslint-disable no-alert */
/* eslint-disable no-console */

import { css } from 'glamor';
import memoize from 'memoize-one';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ReactWebChat, {
  createBrowserWebSpeechPonyfillFactory,
  createCognitiveServicesBingSpeechPonyfillFactory,
  createCognitiveServicesSpeechServicesPonyfillFactory
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

const createStyleOptionsFromProps = (
  hideSendBox,
  botAvatarInitials,
  userAvatarInitials,
  showNub,
  styleBubbleBorder,
  wordBreak,
  richCardWrapTitle
) => ({
  ...(styleBubbleBorder === 'deprecated'
    ? {
        bubbleBorder: 'dotted 2px Red',
        bubbleBorderRadius: 10,
        bubbleFromUserBorder: 'dashed 2px Green',
        bubbleFromUserBorderRadius: 10
      }
    : styleBubbleBorder
    ? {
        bubbleBorderColor: 'Red',
        bubbleBorderRadius: 10,
        bubbleBorderStyle: 'dotted',
        bubbleBorderWidth: 2,
        bubbleFromUserBorderColor: 'Green',
        bubbleFromUserBorderRadius: 10,
        bubbleFromUserBorderStyle: 'dashed',
        bubbleFromUserBorderWidth: 2
      }
    : {}),

  ...(showNub
    ? {
        bubbleFromUserNubSize: 10,
        bubbleFromUserNubOffset: -5,
        bubbleNubOffset: 5,
        bubbleNubSize: 10
      }
    : {}),

  botAvatarInitials,
  hideSendBox,
  userAvatarInitials,
  messageActivityWordBreak: wordBreak,
  richCardWrapTitle
});

const fetchAndMemoizeBingSpeechAuthorizationToken = memoize(
  () =>
    fetch('https://webchat-mockbot.azurewebsites.net/bingspeech/token', { method: 'POST' })
      .then(res => res.json())
      .then(({ token }) => token),
  (x, y) => Math.abs(x - y) < 60000
);

const fetchAndMemoizeSpeechServicesAuthorizationToken = memoize(
  () =>
    fetch('https://webchat-mockbot.azurewebsites.net/speechservices/token', { method: 'POST' })
      .then(res => res.json())
      .then(({ token }) => token),
  (x, y) => Math.abs(x - y) < 60000
);

const App = ({ store }) => {
  const params = new URLSearchParams(window.location.search);
  const directLineToken = params.get('t');
  const domain = params.get('domain');
  const userID = params.get('u');
  const speech = params.get('speech');
  const webSocket = params.get('websocket');

  const activityMiddleware = createDevModeActivityMiddleware();

  const attachmentMiddleware = createDevModeAttachmentMiddleware();

  const mainRef = useRef();

  useEffect(() => {
    const { current } = mainRef;
    const sendBox = current && current.querySelector('input[type="text"]');

    sendBox && sendBox.focus();
  }, []);

  const [botAvatarInitials, setBotAvatarInitials] = useState('BF');

  const directLine = useMemo(
    () =>
      createFaultyDirectLine({
        domain,
        fetch,
        token: directLineToken,
        webSocket: webSocket === 'true' || !!+webSocket
      }),
    [domain, directLineToken, webSocket]
  );

  const [disabled, setDisabledUI] = useState(false);

  const [faulty, setFaultyDirectLine] = useState(false);

  const [groupTimestamp, setGroupTimestamp] = useState(() =>
    window.sessionStorage.getItem('PLAYGROUND_GROUP_TIMESTAMP')
  );

  const [hideSendBox, setHideSendBox] = useState(false);

  const [language, setLanguage] = useState(
    () => window.sessionStorage.getItem('PLAYGROUND_LANGUAGE') || window.navigator.language
  );

  useEffect(() => {
    document.querySelector('html').setAttribute('lang', language);
  }, [language]);

  const [richCardWrapTitle, setRichCardWrapTitle] = useState(false);

  const [sendTimeout, setSendTimeout] = useState(() => window.sessionStorage.getItem('PLAYGROUND_SEND_TIMEOUT') || '');

  const [sendTypingIndicator, setSendTypingIndicator] = useState(true);

  const [showNub, setShowNub] = useState(true);

  const [styleBubbleBorder, setStyleBubbleBorder] = useState(false);

  const [userAvatarInitials, setUserAvatarInitials] = useState('WC');

  const username = 'Web Chat user';

  const [voiceGenderPreference, setVoiceGenderPreference] = useState(
    window.sessionStorage.getItem('PLAYGROUND_VOICE_GENDER_PREFERENCE')
  );

  const [webSpeechPonyfillFactory, setWebSpeechPonyfillFactory] = useState();

  const [wordBreak, setWordBreak] = useState('');

  const handleBotAvatarInitialsChange = useCallback(
    ({ target: { value } }) => {
      setBotAvatarInitials(value);
    },
    [setBotAvatarInitials]
  );

  const handleVoiceGenderPreferenceChange = useCallback(
    ({ target: { value } }) => {
      setVoiceGenderPreference(value || null);
      window.sessionStorage.setItem('PLAYGROUND_VOICE_GENDER_PREFERENCE', value);
    },
    [setVoiceGenderPreference]
  );

  const handleBubbleBorderChange = useCallback(
    ({ target: { value } }) => {
      setStyleBubbleBorder(!!value && (value === 'true' || (value === 'deprecated' && 'deprecated')));
    },
    [setStyleBubbleBorder]
  );

  const handleDisconnectClick = useCallback(() => {
    store.dispatch({ type: 'DIRECT_LINE/DISCONNECT' });
  }, [store]);

  const handleGroupTimestampChange = useCallback(
    ({ target: { value } }) => {
      setGroupTimestamp(!!value);
      window.sessionStorage.setItem('PLAYGROUND_GROUP_TIMESTAMP', value);
    },
    [setGroupTimestamp]
  );

  const handleDisabledChange = useCallback(
    ({ target: { checked } }) => {
      setDisabledUI(!!checked);
    },
    [setDisabledUI]
  );

  const handleErrorClick = useCallback(() => {
    store.dispatch({ type: 'DIRECT_LINE/POST_ACTIVITY' });
  }, [store]);

  const handleHideSendBoxChange = useCallback(
    ({ target: { checked } }) => {
      setHideSendBox(!!checked);
    },
    [setHideSendBox]
  );

  const handleLanguageChange = useCallback(
    ({ target: { value } }) => {
      setLanguage(value);
      document.querySelector('html').setAttribute('lang', value || window.navigator.language);
      window.sessionStorage.setItem('PLAYGROUND_LANGUAGE', value);
    },
    [setLanguage]
  );

  const handleReliabilityChange = useCallback(
    ({ target: { checked } }) => {
      setFaultyDirectLine(!checked);
      directLine.setFaulty(faulty);
    },
    [directLine, faulty, setFaultyDirectLine]
  );

  const handleResetClick = useCallback(() => {
    window.sessionStorage.removeItem('REDUX_STORE');
    window.location.reload();
  }, []);

  const handleRichCardWrapTitleChange = useCallback(
    ({ target: { checked } }) => {
      setRichCardWrapTitle(checked);
    },
    [setRichCardWrapTitle]
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

  const handleShowNubChange = useCallback(
    ({ target: { checked } }) => {
      setShowNub(checked);
    },
    [setShowNub]
  );

  const handleUseEmulatorCoreClick = useCallback(() => {
    window.sessionStorage.removeItem('REDUX_STORE');
    window.location.href = '?domain=http://localhost:5000/v3/directline&websocket=0&u=default-user';
  }, []);

  const handleUserAvatarInitialsChange = useCallback(
    ({ target: { value } }) => {
      setUserAvatarInitials(value);
    },
    [setUserAvatarInitials]
  );

  const handleUseMockBot = useCallback(async url => {
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
  }, []);

  const selectVoiceWithGender = useCallback(
    voiceGenderPreference
      ? (voices, activity) =>
          [activity.locale, language, window.navigator.language, 'en-US'].reduce(
            (result, targetLanguage) =>
              result ||
              voices.find(
                ({ gender, lang, name }) =>
                  (gender || '').toLowerCase() === voiceGenderPreference &&
                  lang === targetLanguage &&
                  /neural/iu.test(name)
              ) ||
              voices.find(
                ({ gender, lang }) => (gender || '').toLowerCase() === voiceGenderPreference && lang === targetLanguage
              ),
            null
          ) || voices[0]
      : undefined,
    [language, voiceGenderPreference]
  );

  useEffect(() => {
    if (speech === 'bingspeech') {
      createCognitiveServicesBingSpeechPonyfillFactory({
        authorizationToken: () => fetchAndMemoizeBingSpeechAuthorizationToken(Date.now())
      }).then(webSpeechPonyfillFactory => setWebSpeechPonyfillFactory(() => webSpeechPonyfillFactory));
    } else if (speech === 'speechservices') {
      const webSpeechPonyfillFactory = createCognitiveServicesSpeechServicesPonyfillFactory({
        authorizationToken: () => fetchAndMemoizeSpeechServicesAuthorizationToken(Date.now()),
        region: 'westus2'
      });

      setWebSpeechPonyfillFactory(() => webSpeechPonyfillFactory);
    } else {
      setWebSpeechPonyfillFactory(() => createBrowserWebSpeechPonyfillFactory());
    }
  }, [speech, setWebSpeechPonyfillFactory]);

  const handleWordBreakChange = useCallback(
    ({ target: { value } }) => {
      setWordBreak(value);
    },
    [setWordBreak]
  );

  const styleOptions = useMemo(
    () =>
      createStyleOptionsFromProps(
        hideSendBox,
        botAvatarInitials,
        userAvatarInitials,
        showNub,
        styleBubbleBorder,
        wordBreak,
        richCardWrapTitle
      ),
    [hideSendBox, botAvatarInitials, userAvatarInitials, showNub, styleBubbleBorder, wordBreak, richCardWrapTitle]
  );

  const handleStartConversationWithOfficialMockBot = useCallback(() => {
    handleUseMockBot('https://webchat-mockbot.azurewebsites.net');
  }, [handleUseMockBot]);

  const handleStartConversationWithLocalMockBot = useCallback(() => {
    handleUseMockBot('http://localhost:3978');
  }, [handleUseMockBot]);

  return (
    <div className={ROOT_CSS} ref={mainRef}>
      <ReactWebChat
        activityMiddleware={activityMiddleware}
        attachmentMiddleware={attachmentMiddleware}
        className={WEB_CHAT_CSS + ''}
        groupTimestamp={groupTimestamp === 'default' ? undefined : groupTimestamp === 'false' ? false : +groupTimestamp}
        directLine={directLine}
        disabled={disabled}
        locale={language}
        selectVoice={selectVoiceWithGender}
        sendTimeout={+sendTimeout || undefined}
        sendTypingIndicator={sendTypingIndicator}
        store={store}
        styleOptions={styleOptions}
        userID={userID}
        username={username}
        webSpeechPonyfillFactory={webSpeechPonyfillFactory}
      />
      <div className="button-bar">
        <button onClick={handleResetClick} type="button">
          Remove history <small>(CTRL-R)</small>
        </button>
        <button onClick={handleStartConversationWithOfficialMockBot} type="button">
          Start conversation with official MockBot
        </button>
        <button onClick={handleUseEmulatorCoreClick} type="button">
          Start conversation with Emulator Core
        </button>
        <button onClick={handleStartConversationWithLocalMockBot} type="button">
          Start conversation with local MockBot
        </button>
        <button onClick={handleDisconnectClick} type="button">
          Disconnect
        </button>
        <button onClick={handleErrorClick} type="button">
          Inject error
        </button>
        <div>
          <label>
            <input checked={!faulty} onChange={handleReliabilityChange} type="checkbox" />
            Reliable connection
          </label>
        </div>
        <div>
          <label>
            Language
            <select onChange={handleLanguageChange} value={language}>
              <option value="">Default ({window.navigator.language})</option>
              <option value="bg-BG">Bulgarian</option>
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
            <select onChange={handleSendTimeoutChange} value={sendTimeout}>
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
            <input checked={sendTypingIndicator} onChange={handleSendTypingIndicatorChange} type="checkbox" />
            Send typing
          </label>
        </div>
        <div>
          <label>
            <input checked={disabled} onChange={handleDisabledChange} type="checkbox" />
            Disabled
          </label>
        </div>
        <div>
          <label>
            <input checked={hideSendBox} onChange={handleHideSendBoxChange} type="checkbox" />
            Hide send box
          </label>
        </div>
        <div>
          <label>
            Group timestamp
            <select onChange={handleGroupTimestampChange} value={groupTimestamp || ''}>
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
              onChange={handleBotAvatarInitialsChange}
              style={{ width: '4em' }}
              type="input"
              value={botAvatarInitials}
            />
            <input
              onChange={handleUserAvatarInitialsChange}
              style={{ width: '4em' }}
              type="input"
              value={userAvatarInitials}
            />
          </label>
        </div>
        <div>
          <label>
            Style bubble border
            <select onChange={handleBubbleBorderChange} value={styleBubbleBorder || 'false'}>
              <option value="false">Don't style bubble</option>
              <option value="true">Style using new options</option>
              <option value="deprecated">Style using old bubbleBorder</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            <input checked={showNub} onChange={handleShowNubChange} type="checkbox" />
            Show bubble nub
          </label>
        </div>
        <div>
          <label>
            Word break
            <select onChange={handleWordBreakChange} value={wordBreak || 'break-word'}>
              <option value="break-word">Break word </option>
              <option value="normal">Normal</option>
              <option value="break-all">Break all</option>
              <option value="keep-all">Keep all</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            <input checked={richCardWrapTitle || false} onChange={handleRichCardWrapTitleChange} type="checkbox" />
            Rich card wrap title
          </label>
        </div>
        <div>
          <label>
            Voice gender preference
            <select onChange={handleVoiceGenderPreferenceChange} value={voiceGenderPreference || ''}>
              <option value="">No preferences</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
};

export default App;
