import React, { useEffect, useMemo } from 'react';
import ReactWebChat, { createDirectLine } from 'botframework-webchat';

import './WebChat.css';

const WebChat = ({ className, onFetchToken, store, token, styleOptions, webSpeechPonyfillFactory }) => {
  const directLine = useMemo(() => createDirectLine({ token }), [token]);

  useEffect(() => {
    const $style = document.createElement("style");
    document.head.appendChild($style);
    const buttonCss = `.ac-pushButton {
      color: ${styleOptions.suggestedActionTextColor} !important;
      border: 1px solid #cccccc;
      border-radius: 5px;
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
  }`
    $style.innerHTML = buttonCss;

    onFetchToken();
  }, [onFetchToken]);

  return token ? (
      <ReactWebChat className={`${className || ''} web-chat`} directLine={directLine} store={store} styleOptions={styleOptions} webSpeechPonyfillFactory={webSpeechPonyfillFactory} />
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
