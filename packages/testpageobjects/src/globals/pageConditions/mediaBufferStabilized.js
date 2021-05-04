import stabilized from './stabilized';

export default function mediaBuffered(mediaElement) {
  return stabilized('media', () => getBufferedEnd(mediaElement));
}
