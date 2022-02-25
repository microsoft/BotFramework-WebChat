import { decode } from 'base64-arraybuffer';
import buildSSML from './buildSSML';
import isSSML from './isSSML';

const DEFAULT_LANGUAGE = 'en-US';
const DEFAULT_OUTPUT_FORMAT = 'riff-16khz-16bit-mono-pcm';
const DEFAULT_VOICE = 'en-US-JennyNeural';
const EMPTY_RIFF_WAVE_BASE64 =
  'UklGRoYBAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAATElTVBoAAABJTkZPSVNGVA4AAABMYXZmNTcuODMuMTAwAGRhdGFAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';

export default async function fetchSpeechData({
  deploymentId,
  fetchCredentials,
  lang = DEFAULT_LANGUAGE,
  outputFormat = DEFAULT_OUTPUT_FORMAT,
  pitch,
  rate,
  text,
  voice = DEFAULT_VOICE,
  volume
}) {
  if (!text) {
    // If text is empty, play a short audio clip. This allows developers to easily prime the AudioContext object by playing an empty string.
    return decode(EMPTY_RIFF_WAVE_BASE64);
  }

  const { authorizationToken, region, speechSynthesisHostname, subscriptionKey } = await fetchCredentials();

  if (!authorizationToken && !subscriptionKey) {
    throw new Error('Either "authorizationToken" or "subscriptionKey" must be set.');
  } else if (authorizationToken && subscriptionKey) {
    throw new Error('Only "authorizationToken" or "subscriptionKey" should be set.');
  } else if ((region && speechSynthesisHostname) || (!region && !speechSynthesisHostname)) {
    throw new Error('Only "region" or "speechSynthesisHostname" should be set.');
  }

  const ssml = isSSML(text) ? text : buildSSML({ lang, pitch, rate, text, voice, volume });

  // Although calling encodeURI on hostname does not actually works, it fails faster and safer.
  const hostname =
    speechSynthesisHostname ||
    (deploymentId
      ? `${encodeURI(region)}.voice.speech.microsoft.com`
      : `${encodeURI(region)}.tts.speech.microsoft.com`);
  const search = deploymentId ? `?deploymentId=${encodeURI(deploymentId)}` : '';
  const url = `https://${hostname}/cognitiveservices/v1${search}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': outputFormat,
      ...(authorizationToken
        ? {
            Authorization: `Bearer ${authorizationToken}`
          }
        : {
            'Ocp-Apim-Subscription-Key': subscriptionKey
          })
    },
    method: 'POST',
    body: ssml
  });

  if (!res.ok) {
    throw new Error(`web-speech-cognitive-services: Failed to syntheis speech, server returned ${res.status}`);
  }

  return res.arrayBuffer();
}
