import type { ReduxState } from '../types/internal/ReduxState';
import type { WebChatActivity } from '../types/WebChatActivity';

const activities = ({ activities }: ReduxState) => activities;

const of = (predicate: (activity: WebChatActivity) => boolean) => (state: ReduxState) =>
  activities(state).filter(predicate);
const ofID = (targetID: string) => of(({ id }) => id === targetID);
const ofType = (targetType: string) => of(({ type }) => type === targetType);

export default activities;
export { of, ofID, ofType };
