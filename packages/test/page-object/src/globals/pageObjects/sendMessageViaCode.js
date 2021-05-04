import { dispatch } from '../testHelpers/createStore';
import allOutgoingActivitiesSent from '../pageConditions/allOutgoingActivitiesSent';

export default async function sendMessageViaCode(text, { waitForSend = true } = {}) {
  dispatch({
    payload: { method: 'code', text },
    type: 'WEB_CHAT/SEND_MESSAGE'
  });

  waitForSend && (await allOutgoingActivitiesSent());
}
