import activityStatuses from '../pageElements/activityStatuses';
import became from './became';

export default function allOutgoingActivitiesSent() {
  return became(
    'all outgoing activities sent',
    () =>
      activityStatuses().every(activityStatusElement => {
        if (!activityStatusElement) {
          return true;
        }

        const { innerText } = activityStatusElement;

        return !innerText.includes('Send failed') && !innerText.includes('Sending');
      }),
    15000
  );
}
