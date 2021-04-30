import became from './became';
import sleep from '../../utils/sleep';

const CHECK_INTERVAL = 200;

function getBufferedEnd(mediaElement) {
  return mediaElement.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA
    ? mediaElement.buffered.length && mediaElement.buffered.end(0)
    : 0;
}

export default function mediaBuffered(mediaElement) {
  return became(
    'for media buffer stabilized',
    async () => {
      const initialBufferedEnd = getBufferedEnd(mediaElement);

      if (getBufferedEnd(mediaElement) !== initialBufferedEnd) {
        await sleep(CHECK_INTERVAL);

        return false;
      }

      return true;
    },
    15000
  );
}
