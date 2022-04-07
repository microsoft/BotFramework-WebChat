import type { Notification } from '../types/internal/Notification';
import type { ReduxState } from '../types/internal/ReduxState';

const notifications = ({ notifications }: ReduxState): { [key: string]: Notification } => notifications;

export default notifications;
