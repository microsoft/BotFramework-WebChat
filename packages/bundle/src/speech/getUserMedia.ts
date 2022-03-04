export default function getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
  const { navigator } = window;

  if (typeof navigator.mediaDevices !== 'undefined') {
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  // Although getUserMedia has vendor prefix, they are only used in very old version of browsers.
  // Using the deprecated `navigator.getUserMedia`.
  // @ts-ignore
  if (typeof navigator.getUserMedia !== 'undefined') {
    // Using the deprecated `navigator.getUserMedia`.
    // @ts-ignore
    return new Promise((resolve, reject) => navigator.getUserMedia(constraints, resolve, reject));
  }

  throw new Error('This browser does not support Web Audio API.');
}
