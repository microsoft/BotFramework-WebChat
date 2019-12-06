import { hooks } from 'botframework-webchat';

const { useActivities } = hooks;

export default function useLastBotActivity() {
  const [activities] = useActivities();

  return [
    activities
      .slice()
      .reverse()
      .find(({ from: { role }, type }) => role === 'bot' && type === 'message')
  ];
}
