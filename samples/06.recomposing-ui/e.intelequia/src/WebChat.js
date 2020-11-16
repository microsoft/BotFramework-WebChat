import React, { useEffect, useMemo } from 'react';
import ReactWebChat, { createDirectLine } from 'botframework-webchat';
import getUser from './Strings'
import './WebChat.css';

const WebChat = ({ className, onFetchToken, store, token, styleOptions, webSpeechPonyfillFactory }) => {
  const directLine = useMemo(() => createDirectLine({ token }), [token]);
  const userId = getUser(window.navigator.language);

  useEffect(() => {
    const $style = document.createElement("style");
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
  a {
    color: ${styleOptions.suggestedActionTextColor};
    text-decoration: none;
  }
  `
    $style.innerHTML = buttonCss;
    onFetchToken();
  }, [onFetchToken]);

  

  
  return token ? (
      <ReactWebChat className={`${className || ''} web-chat`} directLine={directLine} store={store} userID={String(userId)}
       username={String(userId)} styleOptions={styleOptions}
       selectVoice={ (voices, activity) => {
        if (activity.locale === 'es') {
          return voices.find(({ name }) => /HelenaRUS/iu.test(name));
        } else {
          return voices.find(({ name }) => /HazelRUS/iu.test(name));
        }
      }
     } webSpeechPonyfillFactory={webSpeechPonyfillFactory} />
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
