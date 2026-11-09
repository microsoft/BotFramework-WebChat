import dispatchAction from './internal/dispatchAction';
import allOutgoingActivitiesSent from '../pageConditions/allOutgoingActivitiesSent';

export default async function sendMessageViaCode(text, { waitForSend = true } = {}) {
  dispatchAction({
    payload: { method: 'code', text },
    type: 'WEB_CHAT/SEND_MESSAGE'
  });

  waitForSend && (await allOutgoingActivitiesSent());
}
