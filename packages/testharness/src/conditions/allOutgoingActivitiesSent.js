import { getState } from '../utils/createStore';

export default function allOutgoingActivitiesSent() {
  return {
    message: 'all outgoing activities to be sent',
    fn: () => {
      const { activities } = getState();

      return activities
        .filter(({ from: { role } }) => role === 'user')
        .every(({ channelData: { state } }) => state === 'sent');
    }
  };
}
