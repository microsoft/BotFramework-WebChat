export default function getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream> {
  const { navigator } = window;

  if (typeof navigator.mediaDevices !== 'undefined') {
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  // We are intentionally using the deprecated `navigator.getUserMedia` to make sure backward compatibility.
  // @ts-ignore
  if (typeof navigator.getUserMedia !== 'undefined') {
    // We are intentionally using the deprecated `navigator.getUserMedia` to make sure backward compatibility.
    // @ts-ignore
    return new Promise((resolve, reject) => navigator.getUserMedia(constraints, resolve, reject));
  }

  throw new Error('This browser does not support Web Audio API.');
}
