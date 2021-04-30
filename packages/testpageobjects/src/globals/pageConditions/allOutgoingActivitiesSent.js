import became from './became';
import getActivities from '../pageObjects/getActivities';

export default function allOutgoingActivitiesSent() {
  return became(
    'all outgoing activities to be sent',
    () => {
      return getActivities()
        .filter(({ from: { role }, name }) => role === 'user' && name !== '__RUN_HOOK')
        .every(({ channelData: { state } = {} }) => state === 'sent');
    },
    15000
  );
}
