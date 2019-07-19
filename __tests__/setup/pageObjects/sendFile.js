import { timeouts } from '../../constants.json';
import allOutgoingActivitiesSent from '../conditions/allOutgoingActivitiesSent';
import getUploadButton from './getUploadButton';

export default async function sendFile(driver, filename, { waitForSend = true } = {}) {
  const uploadButton = await getUploadButton(driver);

  await uploadButton.sendKeys(filename);
  waitForSend && (await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine));
}
