import classNames from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { createStore, createCognitiveServicesSpeechServicesPonyfillFactory } from 'botframework-webchat';
import WebChat from './WebChat';
import Header from './Header'
import MaximizeButton from './MaximizeButton'
import './fabric-icons-inline.css';
import './MinimizableWebChat.css';
import { setCookie, getCookie, checkCookie } from './CookiesUtils'

//create your forceUpdate hook
function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => ++value); // update the state to force render
}

const MinimizableWebChat = (parameters) => {
  const options = parameters.parameters.parameters;
  const store = useMemo(
    () =>
      createStore({}, ({ dispatch }) => next => action => {
        if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
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
          }
          if (action.payload.activity.type === 'event') {
            switch (action.payload.activity.name) {
              case 'Minimize':
                setMinimized(true);
                setNewMessage(false);
            }
          }
        }

        return next(action);
      }),
    []
  );

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
  const [watermark, setWatermark] = useState();
  const firstTimeVisit = checkCookie('firstTimeVisit', true, { path: '/', maxAge: 2592000 });;
  const [credentials, setCredentials] = useState();

  // To learn about reconnecting to a conversation, see the following documentation:
  // https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-reconnect-to-conversation?view=azure-bot-service-4.0

  // call your hook here
  const forceUpdate = useForceUpdate();
  // let localStorageConversationId = localStorage.getItem('conversationId');
  // setConversationId(localStorageConversationId);

  // let localStorageWatermark = localStorage.getItem('watermark') ?? '';
  // setWatermark(localStorageWatermark);

  const handleFetchToken = useCallback(async () => {
    if (!token) {

      let localStorageConversationId = localStorage.getItem('conversationId');
      setConversationId(localStorageConversationId);

      let localStorageWatermark = localStorage.getItem('watermark') ?? '';
      setWatermark(localStorageWatermark);

      let url = '';
      if (localStorageConversationId) {
        url = options.directlineReconnectTokenUrl + localStorageConversationId + '?watermark=' + localStorageWatermark;
      }
      else {
        url = options.directlineTokenUrl;
      }
      const res = await fetch(url,
        {
          method: 'GET'
        });
      const kk = await res.json();
      debugger;
      setToken(kk.token);
    }
  }, [setToken, token, conversationId, setConversationId]);

  const setFirstTimeCookie = () => {
    var cookie = getCookie('firstTimeVisit');
    if (cookie != false)
      setCookie('firstTimeVisit', false, { path: '/', maxAge: 2592000 });
    forceUpdate();
  }

  const handleMaximizeButtonClick = useCallback(async () => {
    setLoaded(true);
    setMinimized(false);
    setNewMessage(false);
    setFirstTimeCookie()
  }, [setMinimized, setNewMessage]);

  const handleMinimizeButtonClick = useCallback(() => {
    setMinimized(true);
    setNewMessage(false);
  }, [setMinimized, setNewMessage]);

  const handleSwitchButtonClick = useCallback(() => {
    setSide(side === 'left' ? 'right' : 'left');
  }, [setSide, side]);

  // TODO: [P2] Currently, we cannot unmount Web Chat from DOM when it is minimized.
  //       Today, if we unmount it, Web Chat will call disconnect on DirectLineJS object.
  //       When minimized, we still want to maintain that connection while the UI is gone.
  //       This is related to https://github.com/microsoft/BotFramework-WebChat/issues/2750.

  const handleMessageClick = useCallback(async () => {
    setFirstTimeCookie()
    setSide(side)
  }, [setSide, side]);

  const handleRequestSpeechToken = useCallback(async () => {
    const res = await fetch(options.speechTokenUrl, { method: 'POST' });
    const {authorizationToken} = await res.json();
    return authorizationToken;
  });


  const webSpeechPonyfillFactory = useMemo(() => {
      return createCognitiveServicesSpeechServicesPonyfillFactory(
        {
          authorizationToken: handleRequestSpeechToken(),
          region: 'northeurope' // TODO Parameter
        });
  }, []);
  
  return (
    <div className="minimizable-web-chat">
      {getCookie('firstTimeVisit') == 'true' && (options.chatIconMessage !== undefined || options.chatIconMessage !== '' ) && (
        <div className="chat-button-message close-button-no-animate">
          <div className="chat-button-message-arrow"></div>
          <a className="chat-button-message-close" onClick={handleMessageClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-38000 0 42000 2048">
              <path d="M1115 1024 L1658 1567 Q1677 1586 1677 1612.5 Q1677 1639 1658 1658 Q1639 1676 1612 1676 Q1587 1676 1567 1658 L1024 1115 L481 1658 Q462 1676 436 1676 Q410 1676 390 1658 Q371 1639 371 1612.5 Q371 1586 390 1567 L934 1024 L390 481 Q371 462 371 435.5 Q371 409 390 390 Q410 372 436 372 Q462 372 481 390 L1024 934 L1567 390 Q1587 372 1612 372 Q1639 372 1658 390 Q1677 409 1677 435.5 Q1677 462 1658 481 L1115 1024 Z ">
              </path>
            </svg>
          </a>
          <a onClick={handleMaximizeButtonClick}><span>{options.chatIconMessage}</span></a>
        </div>
      )}

      <MaximizeButton maximizeOptions={options.maximize}
        handleMaximizeButtonClick={handleMaximizeButtonClick}
        token={token} newMessage={newMessage} minimized={minimized} />

      {loaded && (
        <div className={classNames(side === 'left' ? 'chat-box left' : 'chat-box right', minimized ? 'hide open-chat-no-animate' : 'open-chat-animate')}>
          <Header handleMinimizeButtonClick={handleMinimizeButtonClick} handleSwitchButtonClick={handleSwitchButtonClick} headerOptions={options.header} />

          {<WebChat
            className="react-web-chat"
            onFetchToken={handleFetchToken}
            store={store}
            styleOptions={styleSet}
            token={token}
            webSpeechPonyfillFactory={webSpeechPonyfillFactory}
          />}
        </div>
      )}
    </div>
  );
};

export default MinimizableWebChat;
