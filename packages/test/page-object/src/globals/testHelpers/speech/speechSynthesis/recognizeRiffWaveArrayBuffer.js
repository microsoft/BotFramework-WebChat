import { AudioStreamFormat } from 'microsoft-cognitiveservices-speech-sdk';

export default async function recognizeRiffWaveArrayBuffer({
  arrayBuffer,
  audioFormat = AudioStreamFormat.getDefaultInputFormat(),
  credentials: { authorizationToken, region, speechRecognitionHostname, subscriptionKey },
  lang = 'en-US'
}) {
  const hostname = speechRecognitionHostname || `${region}.stt.speech.microsoft.com`;
  const search = new URLSearchParams({ format: 'detailed', language: lang });

  const url = `https://${encodeURI(hostname)}/speech/recognition/conversation/cognitiveservices/v1?${search}`;

  const res = await fetch(url, {
    body: arrayBuffer,
    headers: {
      Accept: 'application/json;text/xml',
      'Content-Type': `audio/wav; codecs=audio/pcm; samplerate=${audioFormat.samplesPerSec}`,
      Expect: '100-continue',

      ...(authorizationToken
        ? {
            Authorization: `Bearer ${authorizationToken}`
          }
        : {
            'Ocp-Apim-Subscription-Key': subscriptionKey
          })
    },
    method: 'POST'
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status} while recognizing the WAV file.`);
  }

  const json = await res.json();

  if (json.RecognitionStatus === 'Success') {
    return json.NBest[0].Display;
  }

  throw new Error(`Failed to recognize the WAV file due to ${json.RecognitionStatus}.`);
}
