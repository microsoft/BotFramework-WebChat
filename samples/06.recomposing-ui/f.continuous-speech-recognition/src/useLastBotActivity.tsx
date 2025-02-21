import { hooks } from 'botframework-webchat-api';

const { useActivities } = hooks;

const useLastBotActivity = () => {
  const [activities] = useActivities();
  return activities.filter(
    ({ from: { role }, type, channelData }) => role === 'bot' && type === 'message' && channelData?.speak === true
  );
};

export default useLastBotActivity;
