import { join } from 'path';
import { timeouts } from '../../constants.json';
import allOutgoingActivitiesSent from '../conditions/allOutgoingActivitiesSent';
import getUploadButton from './getUploadButton';

export default async function sendFile(driver, filename, { waitForSend = true } = {}) {
  const uploadButton = await getUploadButton(driver);

  // When running locally, it seems WebDriver is ignoring the FileDetector.
  // So we are prepending the local path here, and remove it when running Docker-based Chrome via FileDetector.
  await uploadButton.sendKeys(join(__dirname, '../local', filename));

  waitForSend && (await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine));
}
