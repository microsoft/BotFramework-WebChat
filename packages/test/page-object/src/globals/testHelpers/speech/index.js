import concatArrayBuffer from './concatArrayBuffer';
import createQueuedArrayBufferAudioSource from './speechRecognition/createQueuedArrayBufferAudioSource';
import createWebSpeechMock from './createWebSpeechMock';
import fetchSpeechData from './speechRecognition/fetchSpeechData';
import float32ArraysToPcmWaveArrayBuffer from './float32ArraysToPcmWaveArrayBuffer';
import MockAudioContext from './speechSynthesis/MockAudioContext';
import pcmWaveArrayBufferToRiffWaveArrayBuffer from './pcmWaveArrayBufferToRiffWaveArrayBuffer';
import recognizeRiffWaveArrayBuffer from './speechSynthesis/recognizeRiffWaveArrayBuffer';

export {
  concatArrayBuffer,
  createQueuedArrayBufferAudioSource,
  createWebSpeechMock,
  fetchSpeechData,
  float32ArraysToPcmWaveArrayBuffer,
  MockAudioContext,
  pcmWaveArrayBufferToRiffWaveArrayBuffer,
  recognizeRiffWaveArrayBuffer
};
