import { posix } from 'path';

import { timeouts } from '../../constants.json';
import allOutgoingActivitiesSent from '../conditions/allOutgoingActivitiesSent';
import getActivityElements from '../elements/getActivityElements';
import getUploadButton from '../elements/getUploadButton';
import minNumActivitiesShown from '../conditions/minNumActivitiesShown.js';

export default async function sendFile(driver, filename, { waitForSend = true } = {}) {
  const uploadButton = await getUploadButton(driver);

  // The send file function is asynchronous, it doesn't send immediately until thumbnails are generated.
  // We will save the numActivities, anticipate for numActivities + 1, then wait until everything is sent
  const numActivities = (await getActivityElements(driver)).length;

  await uploadButton.sendKeys(posix.join('/home/seluser/Downloads', filename));

  await driver.wait(minNumActivitiesShown(numActivities + 1));
  waitForSend && (await driver.wait(allOutgoingActivitiesSent(), timeouts.directLine));
}
