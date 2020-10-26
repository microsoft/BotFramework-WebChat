const NUM_CHECK_INTERVAL = 10;
const CHECK_INTERVAL = 200;

function getBufferedEnd(mediaElement) {
  return mediaElement.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA
    ? mediaElement.buffered.length && mediaElement.buffered.end(0)
    : 0;
}

function sleep(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

export default function mediaBuffered(mediaElement) {
  return {
    message: 'for media buffer stabilized',
    fn: async () => {
      const initialBufferedEnd = getBufferedEnd(mediaElement);

      for (let index = 0; index < NUM_CHECK_INTERVAL; index++) {
        if (getBufferedEnd(mediaElement) !== initialBufferedEnd) {
          return false;
        }

        await sleep(CHECK_INTERVAL);
      }

      return true;
    }
  };
}
