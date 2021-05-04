import allOutgoingActivitiesSent from '../pageConditions/allOutgoingActivitiesSent';
import typeInSendBox from './typeInSendBox';

export default async function sendMessageViaSendBox(text, { waitForSend = true } = {}) {
  await typeInSendBox(text, '\n');

  waitForSend && (await allOutgoingActivitiesSent());
}
