import React, { useEffect, useMemo } from 'react';
import ReactWebChat, { createDirectLine } from 'botframework-webchat';
import { setCookie, getCookie, checkCookie } from './CookiesUtils';
import getUser from './Strings';
import './WebChat.css';

const WebChat = ({
  className,
  onFetchToken,
  store,
  token,
  styleOptions,
  webSpeechPonyfillFactory,
  language,
  selectVoice
}) => {
  useEffect(() => {
    const $style = document.createElement('style');
    document.head.appendChild($style);

    //Colours for adaptiveCards + button hover
    const buttonCss = `.ac-pushButton {
      color: ${styleOptions.suggestedActionTextColor} !important;
      border: 1px solid #cccccc;
      border-radius: 5px;
      font: 400 13.3333px Segoe UI;
    }
  .ac-pushButton:hover {
    color: ${styleOptions.suggestedActionBackground} !important;
    background-color: ${styleOptions.suggestedActionTextColor} !important;
    border-color: ${styleOptions.suggestedActionTextColor};
  }
  .webchat__suggested-action__button:hover {
    background-color: ${styleOptions.suggestedActionTextColor} !important;
    color: ${styleOptions.suggestedActionBackground} !important;
    border-color: ${styleOptions.suggestedActionTextColor} !important;
  }
  .ac-actionSet{
    font-family: "Segoe UI", sans-serif !important;
  }
  .ac-textBlock {
    color:${styleOptions.bubbleTextColor} !important;
  }
  button {
    transition: color .2s ease, background-color .2s ease;
  }
  .minimizable-web-chat a {
    color: ${styleOptions.suggestedActionTextColor};
    text-decoration: none;
  }
  .ac-pushButton[aria-pressed="true"] {
    background-color: ${styleOptions.suggestedActionBackground} !important;
    border-color: #cccccc !important;
    color: ${styleOptions.suggestedActionTextColor} !important;
  }
  .ac-pushButton[aria-pressed="true"]:hover {
    color: ${styleOptions.suggestedActionBackground} !important;
    background-color: ${styleOptions.suggestedActionTextColor} !important;
    border-color: ${styleOptions.suggestedActionTextColor};
  }
  .cancelButton{
    background-color: ${styleOptions.streamingCancelButtonColor} !important;
    color: ${styleOptions.streamingCancelButtonTextColor} !important;
  }
  .cancelButton:hover {
    background-color: ${styleOptions.streamingCancelButtonColorOnHover};
  }
  `;
    $style.innerHTML = buttonCss;
    onFetchToken();
  }, [onFetchToken]);

  let conversationId = getCookie('bci');
  let directLine = undefined;

  var date = new Date();
  date.setDate(date.getDate() + 2);

  directLine = useMemo(() => createDirectLine({ token }), [token]);

  if (token && !conversationId && directLine.conversationId) {
    setCookie('bci', directLine.conversationId, { path: '/', expires: date });
  }

  const userId = getUser(window.navigator.language);

  return token ? (
    <ReactWebChat
      className={`${className || ''} web-chat`}
      directLine={directLine}
      store={store}
      styleOptions={styleOptions}
      userID={String(userId)}
      username={String(userId)}
      webSpeechPonyfillFactory={webSpeechPonyfillFactory}
      locale={language ? language : directLine.locale}
      selectVoice={selectVoice}
    />
  ) : (
    <div className={`${className || ''} connect-spinner`}>
      <div className="content">
        <div className="icon">
          <span className="ms-Icon ms-Icon--Robot" />
        </div>
        <p>Please wait while we are connecting.</p>
      </div>
    </div>
  );
};

export default WebChat;
