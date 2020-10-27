import { Condition } from 'selenium-webdriver';

// We will check buffered duration for 5 times of each 300ms interval.
// If all 3 checks return the same buffered length, we will consider the buffering has stabilized.
const NUM_BUFFERED_CHECK = 5;
const BUFFERED_CHECK_INTERVAL = 300;

export default function mediaBuffered(mediaElement) {
  return new Condition('for audio to finish buffering', async driver => {
    for (let index = 0; index < NUM_BUFFERED_CHECK; index++) {
      const result = await driver.executeScript(mediaElement => {
        const bufferedDuration = mediaElement.buffered.length && mediaElement.buffered.end(0);
        const buffered =
          mediaElement.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA &&
          bufferedDuration === mediaElement.__lastBufferedDuration;

        mediaElement.__lastBufferedDuration = bufferedDuration;

        return buffered;
      }, mediaElement);

      if (!result) {
        return false;
      }

      await driver.sleep(BUFFERED_CHECK_INTERVAL);
    }

    return true;
  });
}
