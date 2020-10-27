import classNames from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { createStore, createCognitiveServicesSpeechServicesPonyfillFactory } from 'botframework-webchat';
import WebChat from './WebChat';
import './fabric-icons-inline.css';
import './MinimizableWebChat.css';

const MinimizableWebChat = () => {
  const store = useMemo(
    () =>
      createStore({}, ({ dispatch }) => next => action => {
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
        } else if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          if (action.payload.activity.from.role === 'bot') {
            setNewMessage(true);
          }
        }

        return next(action);
      }),
    []
  );

  const styleSet = {
    backgroundColor: '#FFFFFF', //parameter
    bubbleBackground: 'rgba(241, 241, 244, 1)', //parameter
    bubbleFromUserBackground: '#8A8A8A', //pparameter

    //Bot Nub
    showNub: true,
    bubbleNubOffset: -8,
    bubbleNubSize: 10,
    bubbleBorderRadius: 10,
    bubbleTextColor: '#575a5e', //parameter

    avatarSize: 32,
    botAvatarInitials: 'BF',
    botAvatarImage: 'https://turismobot.intelequia.com/images/goio-square-icon-32.png', //parameter


    //User Nub
    bubbleFromUserNubOffset: -8,
    bubbleFromUserNubSize: 10,
    bubbleFromUserBorderRadius:10,
    bubbleFromUserTextColor: '#ffffff', //parameter
    hideUploadButton: true,

    //buttons
    suggestedActionBackground: 'White', //parameter
    suggestedActionBorderRadius: 5,
    suggestedActionBorderColor: '#cccccc',
    suggestedActionTextColor: '#ed823c',

    // transcriptOverlayButtonBackground: 'White',
    // transcriptOverlayButtonBackgroundOnFocus: 'rgba(0, 0, 0, .8)',
    // transcriptOverlayButtonBackgroundOnHover: '#ed823c',
    // transcriptOverlayButtonColor: '#ed823c',
    // transcriptOverlayButtonColorOnFocus: undefined, // defaults to transcriptOverlayButtonColor
    // transcriptOverlayButtonColorOnHover: 'White' // defaults to transcriptOverlayButtonColor
  };

  const [loaded, setLoaded] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [newMessage, setNewMessage] = useState(false);
  const [side, setSide] = useState('right');
  const [token, setToken] = useState();

  // To learn about reconnecting to a conversation, see the following documentation:
  // https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-reconnect-to-conversation?view=azure-bot-service-4.0

  const handleFetchToken = useCallback(async () => {
    if (!token) {
      const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
      const { token } = await res.json();

      setToken(token);
    }
  }, [setToken, token]);

  const handleMaximizeButtonClick = useCallback(async () => {
    setLoaded(true);
    setMinimized(false);
    setNewMessage(false);
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

  const handleRequestSpeechToken = useCallback(async () => {
    const res = await fetch('https://webchat-mockbot.azurewebsites.net/speechservices/token', { method: 'POST' });
    const { token } = await res.json();

    return token;
  });

  const webSpeechPonyfillFactory = useMemo(() => createCognitiveServicesSpeechServicesPonyfillFactory({
    authorizationToken: handleRequestSpeechToken(),
    region: 'westus2' // TODO Parameter
  }), []);

  return (
    <div className="minimizable-web-chat">
      {minimized && (
        <button className="maximize" onClick={handleMaximizeButtonClick}>
          <span className={token ? 'ms-Icon ms-Icon--MessageFill' : 'ms-Icon ms-Icon--Message'} />
          {newMessage && <span className="ms-Icon ms-Icon--CircleShapeSolid red-dot" />}
        </button>
      )}
      {loaded && (
        <div className={classNames(side === 'left' ? 'chat-box left' : 'chat-box right', minimized ? 'hide' : '')}>
          <header>
            <div className="filler" />
            <button className="switch" onClick={handleSwitchButtonClick}>
              <span className="ms-Icon ms-Icon--Switch" />
            </button>
            <button className="minimize" onClick={handleMinimizeButtonClick}>
              <span className="ms-Icon ms-Icon--ChromeMinimize" />
            </button>
          </header>
          { <WebChat
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
