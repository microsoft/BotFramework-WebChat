import getActivities from '../pageObjects/getActivities';

export default function allOutgoingActivitiesSent() {
  return {
    message: 'all outgoing activities to be sent',
    fn: () => {
      return getActivities()
        .filter(({ from: { role } }) => role === 'user')
        .every(({ channelData: { state } }) => state === 'sent');
    }
  };
}
