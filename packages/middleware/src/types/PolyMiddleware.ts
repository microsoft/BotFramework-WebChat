import { type ActivityPolyMiddleware } from '../activityPolyMiddleware';

export type PolyMiddleware = ActivityPolyMiddleware;

export type Init =
  | 'activity'
  | 'activity border'
  | 'activity grouping'
  | 'sendBoxMiddleware'
  | 'sendBoxToolbarMiddleware';
