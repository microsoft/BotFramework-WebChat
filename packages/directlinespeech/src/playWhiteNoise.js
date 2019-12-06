import { decode } from 'base64-arraybuffer';
import EventAsPromise from 'event-as-promise';

const EMPTY_MP3_BASE64 =
  'SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU3LjU2LjEwMQAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU3LjY0AAAAAAAAAAAAAAAAJAUHAAAAAAAAAYYoRBqpAAAAAAD/+xDEAAPAAAGkAAAAIAAANIAAAARMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EMQpg8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

function subscribeEvent(target, name, handler) {
  target.addEventListener(name, handler);

  return () => target.removeEventListener(name, handler);
}

function asyncDecodeAudioData(audioContext, arrayBuffer) {
  return new Promise((resolve, reject) => {
    const promise = audioContext.decodeAudioData(arrayBuffer, resolve, reject);

    // Newer implementation of "decodeAudioData" will return a Promise
    promise && typeof promise.then === 'function' && resolve(promise);
  });
}

function playDecoded(audioContext, audioBuffer, source) {
  return new Promise((resolve, reject) => {
    const audioContextClosed = new EventAsPromise();
    const sourceEnded = new EventAsPromise();
    const unsubscribe = subscribeEvent(
      audioContext,
      'statechange',
      ({ target: { state } }) => state === 'closed' && audioContextClosed.eventListener()
    );

    try {
      source.buffer = audioBuffer;
      // "ended" may not fire if the underlying AudioContext is closed prematurely
      source.onended = sourceEnded.eventListener;

      source.connect(audioContext.destination);
      source.start(0);

      Promise.race([audioContextClosed.upcoming(), sourceEnded.upcoming()]).then(resolve);
    } catch (err) {
      reject(err);
    } finally {
      unsubscribe();
    }
  });
}

export default async function playWhiteNoise(audioContext) {
  const source = audioContext.createBufferSource();
  const audioBuffer = await asyncDecodeAudioData(audioContext, decode(EMPTY_MP3_BASE64));

  await playDecoded(audioContext, audioBuffer, source);
}
