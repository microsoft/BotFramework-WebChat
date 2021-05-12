import stabilized from './stabilized';

function getBufferedEnd(mediaElement) {
  return mediaElement.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA
    ? mediaElement.buffered.length && mediaElement.buffered.end(0)
    : 0;
}

export default function mediaBuffered(mediaElement) {
  return stabilized('media', () => getBufferedEnd(mediaElement), 5, 15000);
}
