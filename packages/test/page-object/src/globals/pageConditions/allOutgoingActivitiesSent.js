import became from './became';
import getActivities from '../pageObjects/getActivities';

export default function allOutgoingActivitiesSent() {
  return became(
    'all outgoing activities sent',
    () =>
      getActivities()
        .filter(({ from: { role }, name, type }) => role === 'user' && name !== '__RUN_HOOK' && type === 'message')
        .every(({ channelData: { 'webchat:send-status': sendStatus } = {} }) => sendStatus === 'sent'),
    15000
  );
}
