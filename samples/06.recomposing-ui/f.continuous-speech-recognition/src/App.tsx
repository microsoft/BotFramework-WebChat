import { Components, createBrowserWebSpeechPonyfillFactory, createDirectLine, hooks } from 'botframework-webchat';
import './App.css';

const { Composer, BasicWebChat } = Components;

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import BotResponse from './BotResponse';
import classNames from 'classnames';
import Keyboard from './Assets/Keyboard';
import SendBox from './SendBox';
import MicrophoneButton from './MicrophoneButton';
import useUnSpokenActivities from './useUnSpokenActivities';

const { useShouldSpeakIncomingActivity, useStopDictate } = hooks;

type ReactSpeechWebChatViewProps = {
  readonly changeView: (view: string) => void;
  readonly currentView: 'speech' | 'text';
};

const ReactSpeechWebChatView = ({ changeView, currentView }: ReactSpeechWebChatViewProps) => {
  const [, setShouldSpeakIncomingActivity] = useShouldSpeakIncomingActivity();
  const unSpokenActivities = useUnSpokenActivities();

  const stopDictate = useStopDictate();
  const toggleChatView = useCallback(() => {
    changeView('text');
    setShouldSpeakIncomingActivity(false);
    stopDictate();
  }, [changeView, setShouldSpeakIncomingActivity, stopDictate]);

  return (
    <React.Fragment>
      {currentView === 'speech' ? (
        <div className={classNames('pill-style', { 'speaking-style': unSpokenActivities.length }, 'pillContainer')}>
          <BotResponse />
          <button className={classNames('icon-button', 'keyboardButton')} onClick={toggleChatView} type="button">
            <Keyboard className={classNames('keyboard-style', 'keyboardIcon')} />
          </button>
          <MicrophoneButton changeView={changeView} />
        </div>
      ) : (
        <BasicWebChat className={'chatBot'} role={'main'} />
      )}
    </React.Fragment>
  );
};

const App = () => {
  const [directLine, setDirectLine] = useState<ReturnType<typeof createDirectLine>>();
  const [currentView, setCurrentSpeechWebChatView] = useState<'speech' | 'text'>('speech');
  const webSpeechPonyfillFactory = useMemo(() => createBrowserWebSpeechPonyfillFactory(), []);

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    (async function () {
      const res = await fetch(
        'https://hawo-mockbot4-token-app.blueriver-ce85e8f0.westus.azurecontainerapps.io/api/token/directline',
        { method: 'POST', signal }
      );

      const { token } = await res.json();

      signal.aborted || setDirectLine(createDirectLine({ token }));
    })();

    return () => abortController.abort();
  }, [setDirectLine]);

  const handleChangeView = useCallback(newView => {
    setCurrentSpeechWebChatView(newView);
  }, []);

  const SendBoxMiddlewareComponent = useMemo(() => <SendBox changeView={handleChangeView} />, [handleChangeView]);

  if (!directLine) {
    return null;
  }

  const composerProps = {
    directLine,
    webSpeechPonyfillFactory,
    styleOptions: { speechRecognitionContinuous: true },
    sendBoxMiddleware: [() => () => () => () => SendBoxMiddlewareComponent]
  };

  return (
    <div className="chat_container">
      <Composer {...composerProps}>
        <ReactSpeechWebChatView changeView={handleChangeView} currentView={currentView} />
      </Composer>
    </div>
  );
};

export default App;
