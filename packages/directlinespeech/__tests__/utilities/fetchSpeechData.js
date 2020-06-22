import fetch from 'node-fetch';

import buildSSML from './buildSSML';
import fetchSpeechCredentialsWithCache from './fetchSpeechCredentialsWithCache';
import isSSML from './isSSML';

const DEFAULT_LANGUAGE = 'en-US';
const DEFAULT_OUTPUT_FORMAT = 'riff-16khz-16bit-mono-pcm';
const DEFAULT_VOICE = 'Microsoft Server Speech Text to Speech Voice (en-US, JessaRUS)';
const SYNTHESIS_URL_TEMPLATE = 'https://{region}.tts.speech.microsoft.com/cognitiveservices/v1';

export default async function fetchSpeechData({
  credentials,
  lang = DEFAULT_LANGUAGE,
  outputFormat = DEFAULT_OUTPUT_FORMAT,
  pitch,
  rate,
  text,
  voice = DEFAULT_VOICE,
  volume
}) {
  credentials || (credentials = await fetchSpeechCredentialsWithCache());

  const { authorizationToken, region } = credentials;
  const ssml = isSSML(text) ? text : buildSSML({ lang, pitch, rate, text, voice, volume });

  // Although calling encodeURI on hostname does not actually works, it fails faster and safer.
  const url = SYNTHESIS_URL_TEMPLATE.replace(/\{region\}/u, encodeURI(region));

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${authorizationToken}`,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': outputFormat
    },
    method: 'POST',
    body: ssml
  });

  if (!res.ok) {
    throw new Error(`Failed to syntheis speech, server returned ${res.status}`);
  }

  return await res.arrayBuffer();
}
