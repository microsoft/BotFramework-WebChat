import { hooks } from 'botframework-webchat-api';

const { useActivities } = hooks;

const useUnSpokenActivities = () => {
  const [activities] = useActivities();
  return activities.filter(
    ({ from: { role }, type, channelData }) => role === 'bot' && type === 'message' && channelData?.speak === true
  );
};

export default useUnSpokenActivities;
