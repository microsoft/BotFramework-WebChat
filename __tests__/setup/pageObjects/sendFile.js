import { join, posix } from 'path';
import { timeouts } from '../../constants.json';
import allOutgoingActivitiesSent from '../conditions/allOutgoingActivitiesSent';
import getUploadButton from './getUploadButton';

function resolveDockerFile(filename) {
  return posix.join('/~/Downloads', filename);
}

function resolveLocalFile(filename) {
  return join(__dirname, '../local', filename);
}

export default async function sendFile(driver, filename, { waitForSend = true } = {}) {
  const uploadButton = await getUploadButton(driver);
  const isUnderDocker = !!(await driver.getCapabilities()).get('webdriver.remote.sessionid');

  await uploadButton.sendKeys(isUnderDocker ? resolveDockerFile(filename) : resolveLocalFile(filename));

  waitForSend && (await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine));
}
