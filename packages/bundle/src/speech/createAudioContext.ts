/** Creates an AudioContext object. */
export default function createAudioContext(): AudioContext {
  if (typeof window.AudioContext !== 'undefined') {
    return new window.AudioContext();

    // Required by TypeScript.
  } else if (typeof window['webkitAudioContext'] !== 'undefined') {
    // This is for Safari as Web Audio API is still under vendor-prefixed.
    return new window['webkitAudioContext']();
  }

  // TODO: Fix this.
  throw new Error('This browser does not support Web Audio API.');
}
