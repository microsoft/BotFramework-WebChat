import { Components, createBrowserWebSpeechPonyfillFactory, createDirectLine } from 'botframework-webchat';
import React, { memo, useEffect, useMemo, useState } from 'react';
import './App.css';

import CustomDictationInterims from './CustomDictationInterims';
import CustomMicrophoneButton from './CustomMicrophoneButton';
import LastBotActivity from './LastBotActivity';

const { Composer } = Components;

function App() {
  const [directLine, setDirectLine] = useState<ReturnType<typeof createDirectLine>>();
  const webSpeechPonyfillFactory = useMemo(() => createBrowserWebSpeechPonyfillFactory(), []);

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    (async function () {
      const res = await fetch(
        'https://hawo-mockbot4-token-app.ambitiousflower-67725bfd.westus.azurecontainerapps.io/api/token/directline',
        { method: 'POST', signal }
      );

      const { token } = await res.json();

      signal.aborted || setDirectLine(createDirectLine({ token }));
    })();

    return () => abortController.abort();
  }, [setDirectLine]);

  return (
    !!directLine && (
      <Composer directLine={directLine} webSpeechPonyfillFactory={webSpeechPonyfillFactory}>
        <div className="App">
          <header className="App-header">
            <CustomMicrophoneButton className="App-speech-button" />
            <CustomDictationInterims className="App-speech-interims" />
            <LastBotActivity className="App-bot-activity" />
          </header>
        </div>
      </Composer>
    )
  );
}

export default memo(App);
