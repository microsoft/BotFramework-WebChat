import { map as minOfMap } from '../utils/minOf';

const notifications = ({ notifications }) => notifications;

const of = predicate => state => notifications(state).filter(predicate);
const ofNextExpiring = () => state => minOfMap(notifications(state), ({ expireAt }) => expireAt);

export default notifications;
export { of, ofNextExpiring };
