import { createStore, createStyleSet } from 'botframework-webchat';
import classNames from 'classnames';
import React, { memo, useCallback, useMemo, useState } from 'react';

import WebChat from './WebChat';

import './fabric-icons-inline.css';
import './MinimizableWebChat.css';

function MinimizableWebChat() {
  const [loaded, setLoaded] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [newMessage, setNewMessage] = useState(false);
  const [side, setSide] = useState('right');
  const [token, setToken] = useState<string>('');

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

  const styleSet = useMemo(() => createStyleSet({ backgroundColor: 'Transparent' }), []);

  // To learn about reconnecting to a conversation, see the following documentation:
  // https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-reconnect-to-conversation?view=azure-bot-service-4.0

  const handleFetchToken = useCallback(async () => {
    if (!token) {
      const res = await fetch(
        'https://hawo-mockbot4-token-app.ambitiousflower-67725bfd.westus.azurecontainerapps.io/api/token/directline',
        { method: 'POST' }
      );
      const { token } = await res.json();

      setToken(token);
    }
  }, [setToken, token]);

  const handleMaximizeButtonClick = useCallback<() => void>(() => {
    setLoaded(true);
    setMinimized(false);
    setNewMessage(false);
  }, [setMinimized, setNewMessage]);

  const handleMinimizeButtonClick = useCallback<() => void>(() => {
    setMinimized(true);
    setNewMessage(false);
  }, [setMinimized, setNewMessage]);

  const handleSwitchButtonClick = useCallback<() => void>(() => {
    setSide(side === 'left' ? 'right' : 'left');
  }, [setSide, side]);

  // TODO: [P2] Currently, we cannot unmount Web Chat from DOM when it is minimized.
  //       Today, if we unmount it, Web Chat will call disconnect on DirectLineJS object.
  //       When minimized, we still want to maintain that connection while the UI is gone.
  //       This is related to https://github.com/microsoft/BotFramework-WebChat/issues/2750.

  return (
    <div className="minimizable-web-chat">
      {minimized && (
        <button className="maximize" onClick={handleMaximizeButtonClick} type="button">
          <span className={token ? 'ms-Icon ms-Icon--MessageFill' : 'ms-Icon ms-Icon--Message'} />
          {newMessage && <span className="ms-Icon ms-Icon--CircleShapeSolid red-dot" />}
        </button>
      )}
      {loaded && (
        <div className={classNames(side === 'left' ? 'chat-box left' : 'chat-box right', minimized ? 'hide' : '')}>
          <header>
            <div className="filler" />
            <button className="switch" onClick={handleSwitchButtonClick} type="button">
              <span className="ms-Icon ms-Icon--Switch" />
            </button>
            <button className="minimize" onClick={handleMinimizeButtonClick} type="button">
              <span className="ms-Icon ms-Icon--ChromeMinimize" />
            </button>
          </header>
          <WebChat
            className="react-web-chat"
            onFetchToken={handleFetchToken}
            store={store}
            styleSet={styleSet}
            token={token}
          />
        </div>
      )}
    </div>
  );
}

export default memo(MinimizableWebChat);
