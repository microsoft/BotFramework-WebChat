import { Components, createDirectLineSpeechAdapters } from 'botframework-webchat';

import React, { useEffect, useState } from 'react';

import fetchCognitiveServicesCredentials from './fetchSpeechServicesCredentials';
import SmartDisplay from './SmartDisplay';

const { Composer } = Components;

const App = () => {
  const [directLineSpeechAdapters, setDirectLineSpeechAdapters] = useState();

  useEffect(() => {
    (async () =>
      setDirectLineSpeechAdapters(
        await createDirectLineSpeechAdapters({
          fetchCredentials: fetchCognitiveServicesCredentials
        })
      ))();
  }, [setDirectLineSpeechAdapters]);

  return (
    !!directLineSpeechAdapters && (
      <Composer {...directLineSpeechAdapters}>
        <SmartDisplay />
      </Composer>
    )
  );
};

export default App;
