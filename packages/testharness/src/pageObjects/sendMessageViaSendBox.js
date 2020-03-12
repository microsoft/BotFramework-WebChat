import { timeouts } from '../constants';
import allOutgoingActivitiesSent from '../conditions/allOutgoingActivitiesSent';
import typeOnSendBox from './typeOnSendBox';
import wait from './wait';

export default async function sendMessageViaSendBox(text, { waitForSend = true } = {}) {
  await typeOnSendBox(text, '\n');

  waitForSend && (await wait(allOutgoingActivitiesSent(), timeouts.directLine));
}
