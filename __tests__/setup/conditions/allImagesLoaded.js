import { Condition } from 'selenium-webdriver';

export default function () {
  return new Condition('Waiting for all images to be loaded', async driver =>
    await driver.executeScript(() => [].every.call(document.querySelectorAll('img'), ({ complete }) => complete))
  );
}
