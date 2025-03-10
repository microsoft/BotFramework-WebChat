import { By } from 'selenium-webdriver';

import getTranscript from './getTranscript';

export default async function getScrollToBottomButton(driver) {
  const transcript = await getTranscript(driver);

  return await transcript.findElement(By.css('.webchat__scroll-to-end-button'));
}
