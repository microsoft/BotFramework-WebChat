import { By, Key } from 'selenium-webdriver';

import { timeouts } from '../../constants.json';
import allOutgoingActivitiesSent from '../conditions/allOutgoingActivitiesSent';

export default async function (driver, text) {
  const input = await driver.findElement(By.css('input[type="text"]'));

  await input.sendKeys(text, Key.RETURN);
  await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine);
}
