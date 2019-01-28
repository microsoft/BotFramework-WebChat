import { Condition } from 'selenium-webdriver';

import minNumActivitiesShown from './minNumActivitiesShown';

export default function () {
  return new Condition('Waiting for bot to connect', async driver =>
    await driver.executeScript(() => ~window.WebChatTest.actions.findIndex(({ type }) => type === 'DIRECT_LINE/CONNECT_FULFILLED'))
    && minNumActivitiesShown(1).fn(driver)
  );
}
