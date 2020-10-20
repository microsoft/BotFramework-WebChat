// We will check buffered duration for 5 times of each 300ms interval.
// If all 3 checks return the same buffered length, we will consider the buffering has stabilized.
const BUFFERED_CHECK_INTERVAL = 300;
const NUM_BUFFERED_CHECK = 5;

export default function mediaBuffered(mediaElement) {
  return {
    message: 'for media to finish buffering',
    fn: async () => {
      for (let index = 0; index < NUM_BUFFERED_CHECK; index++) {
        const bufferedDuration = mediaElement.buffered.length && mediaElement.buffered.end(0);
        const buffered =
          mediaElement.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA &&
          bufferedDuration === mediaElement.__lastBufferedDuration;

        mediaElement.__lastBufferedDuration = bufferedDuration;

        if (!buffered) {
          return false;
        }

        await new Promise(resolve => setTimeout(resolve, BUFFERED_CHECK_INTERVAL));
      }

      return true;
    }
  };
}
