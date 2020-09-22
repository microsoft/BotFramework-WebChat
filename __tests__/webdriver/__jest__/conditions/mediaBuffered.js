import { Condition } from 'selenium-webdriver';

export default function mediaBuffered(mediaElement) {
  return new Condition('for audio to finish buffering', async driver => {
    const result = await driver.executeScript(mediaElement => {
      return (
        mediaElement.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA &&
        mediaElement.buffered.length &&
        mediaElement.buffered.end(0) === mediaElement.duration
      );
    }, mediaElement);

    // TODO: If the result is positive, audio finished buffering, we still need to wait for an unknown time to refresh the UI.
    //       Will be great if we can remove this sleep.
    result && (await driver.sleep(2000));

    return result;
  });
}
