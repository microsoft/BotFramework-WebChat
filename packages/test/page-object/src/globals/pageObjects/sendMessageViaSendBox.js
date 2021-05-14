import allOutgoingActivitiesSent from '../pageConditions/allOutgoingActivitiesSent';
import numActivitiesShown from '../pageConditions/numActivitiesShown';
import getActivityElements from '../pageElements/activities';
import typeInSendBox from './typeInSendBox';

export default async function sendMessageViaSendBox(text, { waitForNumResponse = 0, waitForSend = true } = {}) {
  if (typeof waitForNumResponse !== 'number' || waitForNumResponse < 0) {
    throw new Error(
      '"waitForNumResponses" passed to the second argument of "sendMessageViaSendBox" must be zero or a positive number.'
    );
  }

  const numActivitiesShownBeforeSend = waitForNumResponse && (await getActivityElements()).length;

  await typeInSendBox(text, '\n');

  waitForSend && (await allOutgoingActivitiesSent());
  waitForNumResponse && (await numActivitiesShown(numActivitiesShownBeforeSend + 1 + waitForNumResponse));
}
