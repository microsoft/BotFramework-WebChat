import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createStore, createCognitiveServicesSpeechServicesPonyfillFactory } from 'botframework-webchat';
import WebChat from './WebChat';
import Header from './Header';
import MaximizeButton from './MaximizeButton';
import './fabric-icons-inline.css';
import './MinimizableWebChat.css';
import { setCookie, getCookie, checkCookie } from './CookiesUtils';
import ReactMarkdown from 'react-markdown';
import getCancelStream from './LocalizedString/StringStreaming';
import TypingAnimation from './Components/TypingAnimation';

//create your forceUpdate hook
function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => ++value); // update the state to force render
}
let interval;
let inTimeout;

const MinimizableWebChat = parameters => {
  const options = parameters.parameters.parameters;
  if (options.reactivateChat && options.proactiveTimeOut == undefined) {
    options.proactiveTimeOut = 50000;
  }
  const store = useMemo(
    () =>
      createStore({}, ({ dispatch }) => next => action => {
        if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
          inTimeout = false;
          dispatch({
            type: 'WEB_CHAT/SEND_EVENT',
            payload: {
              name: 'StartConversation',
              value: {
                locale: options.language
              }
            }
          });
        } else if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          if (action.payload.activity.from.role === 'bot') {
            setNewMessage(true);
            if (options.reactivateChat) {
              if (inTimeout == false) {
                clearInterval(interval);

                interval = setTimeout(() => {
                  dispatch({
                    type: 'WEB_CHAT/SEND_EVENT',
                    payload: {
                      name: 'inactive'
                    }
                  });
                }, options.proactiveTimeOut);
                inTimeout = true;
              }
            }
          }

          if (action.payload.activity.type === 'event') {
            clearInterval(interval);
            switch (action.payload.activity.name) {
              case 'Minimize':
                setMinimized(true);
                setNewMessage(false);
                break;
              case 'ChangeLanguage':
                setLanguage(action.payload.activity.value);
                break;
              case 'Geolocation':
                if (navigator.geolocation) {
                  function success(pos) {
                    const crd = pos.coords;

                    let gps = {
                      latitude: crd.latitude,
                      longitude: crd.longitude
                    };
                    dispatch({
                      type: 'WEB_CHAT/SEND_EVENT',
                      payload: {
                        name: 'GeolocationEvent',
                        value: gps
                      }
                    });
                  }
                  navigator.geolocation.getCurrentPosition(success);
                  break;
                }
              case 'StreamingInfo':
                if (Date.now() - Date.parse(action.payload.activity.timestamp) <= 60000) {
                  if (typeof action.payload.activity.value !== 'boolean') {
                    setStreamingText(action.payload.activity.value);
                  }
                }
                break;

              case 'ToogleStreaming':
                if (Date.now() - Date.parse(action.payload.activity.timestamp) <= 60000) {
                  setStreamingText('');
                  setStreaming(action.payload.activity.value);
                }
                break;
            }
          }
        } else if (action.type === 'WEB_CHAT/SEND_MESSAGE') {
          //Message from user
          inTimeout = false;
          clearTimeout(interval);
          switch (action.payload.method) {
            case 'keyboard':
              if (options.onUserMessage) {
                options.onUserMessage(action.payload.text, options.language);
              }
              break;
            case 'imBack':
            case 'postBack':
              if (options.onActionClick) {
                options.onActionClick(action.payload.text, options.language);
              }
              break;
          }
        }

        return next(action);
      }),
    []
  );

  const handleCancelStream = () => {
    store.dispatch({
      type: 'WEB_CHAT/SEND_EVENT',
      payload: {
        name: 'StopStreaming',
        value: true
      }
    });
    setStreaming(false);
  };
  var styleSet = {
    fontSizeSmall: '80%',
    primaryFont: "'Segoe UI', sans-serif",

    //Bot Nub
    showNub: true,
    bubbleNubOffset: -8,
    bubbleNubSize: 10,
    bubbleBorderRadius: 10,
    avatarSize: 32,

    //User Nub
    bubbleFromUserNubOffset: -8,
    bubbleFromUserNubSize: 10,
    bubbleFromUserBorderRadius: 10,

    // //buttons
    suggestedActionBorderRadius: 5,

    //SendBox
    hideUploadButton: true,
    sendBoxBackground: '#F1F1F4',
    sendBoxButtonColor: undefined, // defaults to subtle
    sendBoxButtonColorOnDisabled: '#CCC',
    sendBoxButtonColorOnFocus: '#333',
    sendBoxButtonColorOnHover: '#333',
    sendBoxDisabledTextColor: undefined, // defaults to subtle
    sendBoxHeight: 50,
    sendBoxMaxHeight: 200,
    sendBoxTextColor: 'Black',
    sendBoxBorderBottom: 'solid 10px white',
    sendBoxBorderTop: 'solid 10px white',
    sendBoxBorderLeft: 'solid 10px white',
    sendBoxBorderRight: 'solid 10px white',
    sendBoxPlaceholderColor: undefined, // defaults to subtle
    sendBoxTextWrap: false,

    transcriptOverlayButtonBackground: '#d2dde5',
    transcriptOverlayButtonBackgroundOnHover: '#ef501f',
    transcriptOverlayButtonColor: '#ed823c',
    transcriptOverlayButtonColorOnHover: 'White' //parameter
  };
  styleSet = { ...styleSet, ...options.style };

  const [loaded, setLoaded] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [newMessage, setNewMessage] = useState(false);
  const [side, setSide] = useState('right');
  const [token, setToken] = useState();
  const [conversationId, setConversationId] = useState();
  const firstTimeVisit = checkCookie('firstTimeVisit', true, { path: '/', maxAge: 2592000 });
  const [credentials, setCredentials] = useState();
  const [language, setLanguage] = useState();

  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  // To learn about reconnecting to a conversation, see the following documentation:
  // https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-reconnect-to-conversation?view=azure-bot-service-4.0

  // call your hook here
  const forceUpdate = useForceUpdate();

  const handleFetchToken = useCallback(async () => {
    if (!token) {
      let localStorageConversationId = getCookie('bci');
      setConversationId(localStorageConversationId);

      let url = '';
      if (localStorageConversationId) {
        url = options.directlineReconnectTokenUrl + localStorageConversationId;
      } else {
        url = options.directlineTokenUrl;
      }
      const res = await fetch(url, {
        method: 'GET'
      });
      const kk = await res.json();
      setLanguage(options.language);
      setToken(kk.token);
    }
  }, [setToken, token, setConversationId, setLanguage]);

  const setFirstTimeCookie = () => {
    var cookie = getCookie('firstTimeVisit');
    if (cookie != false) setCookie('firstTimeVisit', false, { path: '/', maxAge: 2592000 });
    forceUpdate();
  };

  const handleMaximizeButtonClick = useCallback(async () => {
    setLoaded(true);
    setMinimized(false);
    setNewMessage(false);
    setFirstTimeCookie();
    if (options.onMaximizeMinimize) {
      options.onMaximizeMinimize(false, options.language);
    }
  }, [setMinimized, setNewMessage]);

  const handleMinimizeButtonClick = useCallback(() => {
    setMinimized(true);
    setNewMessage(false);
    if (options.onMaximizeMinimize) {
      options.onMaximizeMinimize(true, options.language);
    }
  }, [setMinimized, setNewMessage]);

  const handleSwitchButtonClick = useCallback(() => {
    setSide(side === 'left' ? 'right' : 'left');
  }, [setSide, side]);

  // TODO: [P2] Currently, we cannot unmount Web Chat from DOM when it is minimized.
  //       Today, if we unmount it, Web Chat will call disconnect on DirectLineJS object.
  //       When minimized, we still want to maintain that connection while the UI is gone.
  //       This is related to https://github.com/microsoft/BotFramework-WebChat/issues/2750.

  const handleMessageClick = useCallback(async () => {
    setFirstTimeCookie();
    setSide(side);
  }, [setSide, side]);

  function handleRequestSpeechToken() {
    let expireAfter = 0;
    let lastPromise;

    return () => {
      const now = Date.now();

      if (now > expireAfter) {
        expireAfter = now + 300000;
        lastPromise = fetch(options.speechTokenUrl, {
          method: 'POST'
        }).then(
          res => res.json(),
          err => {
            expireAfter = 0;

            return Promise.reject(err);
          }
        );
      }
      return lastPromise;
    };
  }

  const fetchSpeechServicesCredentials = handleRequestSpeechToken();

  const webSpeechPonyfillFactory = useMemo(() => {
    if (typeof options.speechTokenUrl != 'undefined' && options.speechTokenUrl != '')
      return createCognitiveServicesSpeechServicesPonyfillFactory({
        credentials: fetchSpeechServicesCredentials
      });
    else return null;
  }, []);

  return (
    <div className="minimizable-web-chat">
      {getCookie('firstTimeVisit') == 'true' &&
        (options.chatIconMessage !== undefined || options.chatIconMessage !== '') && (
          <div className="chat-button-message close-button-no-animate">
            <div className="chat-button-message-arrow"></div>
            <a className="chat-button-message-close" onClick={handleMessageClick}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="-38000 0 42000 2048">
                <path d="M1115 1024 L1658 1567 Q1677 1586 1677 1612.5 Q1677 1639 1658 1658 Q1639 1676 1612 1676 Q1587 1676 1567 1658 L1024 1115 L481 1658 Q462 1676 436 1676 Q410 1676 390 1658 Q371 1639 371 1612.5 Q371 1586 390 1567 L934 1024 L390 481 Q371 462 371 435.5 Q371 409 390 390 Q410 372 436 372 Q462 372 481 390 L1024 934 L1567 390 Q1587 372 1612 372 Q1639 372 1658 390 Q1677 409 1677 435.5 Q1677 462 1658 481 L1115 1024 Z "></path>
              </svg>
            </a>
            <a onClick={handleMaximizeButtonClick}>
              <span>{options.chatIconMessage}</span>
            </a>
          </div>
        )}

      <MaximizeButton
        maximizeOptions={options.maximize}
        handleMaximizeButtonClick={handleMaximizeButtonClick}
        newMessage={newMessage}
        minimized={minimized}
      />

      {loaded && (
        <div
          className={classNames(
            side === 'left' ? 'chat-box left' : 'chat-box right',
            minimized ? 'hide open-chat-no-animate' : 'open-chat-animate'
          )}
        >
          <Header
            handleMinimizeButtonClick={handleMinimizeButtonClick}
            handleSwitchButtonClick={handleSwitchButtonClick}
            headerOptions={options.header}
          />
          <WebChat
            style={{ display: streaming ? 'none !important' : 'block' }}
            className={classNames(streaming ? 'webChatNone' : '', 'react-web-chat')}
            onFetchToken={handleFetchToken}
            store={store}
            styleOptions={styleSet}
            token={token}
            webSpeechPonyfillFactory={webSpeechPonyfillFactory}
            language={language}
            selectVoice={options.selectVoice}
          />

          <div hidden={!streaming} className="streamingChat">
            <div className="streamingChatContainer">
              <div className="chatContainer">
                <div className="chatImageDiv">
                  <img className="chatImage" src={options.style.botAvatarImage}></img>
                </div>
                <div className="streamingMessage">
                  <div className="streamingChatLoadig">
                    <ReactMarkdown>{streamingText}</ReactMarkdown>
                    <TypingAnimation></TypingAnimation>
                  </div>
                </div>
              </div>
              <div className="buttonContainer">
                {console.log(options.style)}
                <button className="cancelButton" onClick={handleCancelStream}>
                  {getCancelStream(window.navigator.language)}
                </button>
              </div>
            </div>
          </div>

          {options.brandMessage != undefined && options.brandMessage != '' && (
            <div className="brandmessage">{options.brandMessage}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MinimizableWebChat;
