import allOutgoingActivitiesSent from '../pageConditions/allOutgoingActivitiesSent';
import became from '../pageConditions/became';
import numActivitiesShown from '../pageConditions/numActivitiesShown';
import getActivityElements from '../pageElements/activities';
import getSendBoxTextBoxElement from '../pageElements/sendBoxTextBox';
import typeInSendBox from './typeInSendBox';

export default async function sendMessageViaSendBox(text, { waitForNumResponse = 0, waitForSend = true } = {}) {
  if (typeof waitForNumResponse !== 'number' || waitForNumResponse < 0) {
    throw new Error(
      '"waitForNumResponses" passed to the second argument of "sendMessageViaSendBox" must be zero or a positive number.'
    );
  }

  const numActivitiesShownBeforeSend = waitForNumResponse && (await getActivityElements()).length;

  await typeInSendBox(text, '\n');

  if (waitForSend) {
    await became('send box to be emptied', () => !getSendBoxTextBoxElement()?.value, 1000);
    await allOutgoingActivitiesSent();
  }

  waitForNumResponse && (await numActivitiesShown(numActivitiesShownBeforeSend + 1 + waitForNumResponse));
}
