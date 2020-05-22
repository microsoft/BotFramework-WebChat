import { dispatch } from '../utils/createStore';
import { timeouts } from '../constants';
import allOutgoingActivitiesSent from '../conditions/allOutgoingActivitiesSent';
import wait from './wait';

export default async function sendMessageViaCode(text, { waitForSend = true } = {}) {
  dispatch({
    payload: { method: 'code', text },
    type: 'WEB_CHAT/SEND_MESSAGE'
  });

  waitForSend && (await wait(allOutgoingActivitiesSent(), timeouts.directLine));
}
