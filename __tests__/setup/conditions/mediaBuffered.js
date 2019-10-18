import { Condition } from 'selenium-webdriver';

export default function mediaBuffered(mediaElement) {
  return new Condition('for audio to finish loading', driver =>
    driver.executeScript(mediaElement => {
      return (
        mediaElement.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA &&
        mediaElement.buffered.length &&
        mediaElement.buffered.end(0) === mediaElement.duration
      );
    }, mediaElement)
  );
}
