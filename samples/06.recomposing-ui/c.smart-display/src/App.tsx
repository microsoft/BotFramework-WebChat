import { Components, createBrowserWebSpeechPonyfillFactory, createDirectLine } from 'botframework-webchat';

import React, { memo, useEffect, useState } from 'react';

import fetchDirectLineToken from './fetchDirectLineToken';
import SmartDisplay from './SmartDisplay';

const { Composer } = Components;

function App() {
  const [webChatProps, setWebChatProps] = useState<
    | Readonly<{
        directLine: ReturnType<typeof createDirectLine>;
        webSpeechPonyfillFactory: ReturnType<typeof createBrowserWebSpeechPonyfillFactory>;
      }>
    | undefined
  >();

  useEffect(() => {
    (async () =>
      setWebChatProps({
        directLine: createDirectLine({ token: await fetchDirectLineToken() }),
        webSpeechPonyfillFactory: createBrowserWebSpeechPonyfillFactory()
      }))();
  }, [setWebChatProps]);

  return (
    !!webChatProps && (
      <Composer {...webChatProps}>
        <SmartDisplay />
      </Composer>
    )
  );
}

export default memo(App);
