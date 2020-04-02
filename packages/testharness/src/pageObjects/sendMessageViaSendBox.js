import { timeouts } from '../constants';
import allOutgoingActivitiesSent from '../conditions/allOutgoingActivitiesSent';
import typeInSendBox from './typeInSendBox';
import wait from './wait';

export default async function sendMessageViaSendBox(text, { waitForSend = true } = {}) {
  await typeInSendBox(text, '\n');

  waitForSend && (await wait(allOutgoingActivitiesSent(), timeouts.directLine));
}
