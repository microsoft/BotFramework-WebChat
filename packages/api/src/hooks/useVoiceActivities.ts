import { isVoiceActivity, type WebChatActivity } from 'botframework-webchat-core';
import { useSelector } from './internal/WebChatReduxContext';

const activitiesSelector = (state: { activities: WebChatActivity[] }) => state.activities;

const of = (predicate: (activity: WebChatActivity) => boolean) => (state: { activities: WebChatActivity[] }) =>
  activitiesSelector(state).filter(predicate);

export default function useVoiceActivities(): [WebChatActivity[]] {
  return [useSelector(of(activity => isVoiceActivity(activity)))];
}
