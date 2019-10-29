import { timeouts } from '../../constants.json';

export default async function scrollToTop(driver) {
  await driver.executeScript(() => {
    document.querySelector('[role="log"] > *').scrollTop = 0;
  }, timeouts.ui);
}
