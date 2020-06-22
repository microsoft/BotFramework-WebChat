import { AudioStreamFormat } from 'microsoft-cognitiveservices-speech-sdk';
import fetch from 'node-fetch';

import fetchSpeechCredentialsWithCache from './fetchSpeechCredentialsWithCache';

const DEFAULT_LANGUAGE = 'en-US';
const RECOGNITION_URL_TEMPLATE =
  'https://{region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language={lang}&format=detailed';

export default async function recognizeRiffWaveArrayBuffer(
  riffWaveArrayBuffer,
  audioFormat = AudioStreamFormat.getDefaultInputFormat()
) {
  const { authorizationToken, region } = await fetchSpeechCredentialsWithCache();
  const url = RECOGNITION_URL_TEMPLATE.replace(/\{region\}/u, encodeURI(region)).replace(
    /\{lang\}/u,
    encodeURIComponent(DEFAULT_LANGUAGE)
  );

  const res = await fetch(url, {
    body: Buffer.from(riffWaveArrayBuffer),
    headers: {
      Accept: 'application/json;text/xml',
      Authorization: `Bearer ${authorizationToken}`,
      'Content-Type': `audio/wav; codecs=audio/pcm; samplerate=${audioFormat.samplesPerSec}`,
      Expect: '100-continue'
    },
    method: 'POST'
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status} while recognizing the WAV file.`);
  }

  const json = await res.json();

  if (json.RecognitionStatus === 'Success') {
    return json.NBest[0].Display;
  } else {
    throw new Error(`Failed to recognize the WAV file due to ${json.RecognitionStatus}.`);
  }
}
