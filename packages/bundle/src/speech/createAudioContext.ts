/** Creates an AudioContext object. */
export default function createAudioContext(): AudioContext {
  if (typeof window.AudioContext !== 'undefined') {
    return new window.AudioContext();

    // Required by TypeScript.
    // eslint-disable-next-line dot-notation
  } else if (typeof window['webkitAudioContext'] !== 'undefined') {
    // This is for Safari as Web Audio API is still under vendor-prefixed.
    // eslint-disable-next-line dot-notation
    return new window['webkitAudioContext']();
  }

  // TODO: Fix this.
  throw new Error('This browser does not support Web Audio API.');
}
