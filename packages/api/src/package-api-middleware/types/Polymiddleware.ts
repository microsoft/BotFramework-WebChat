import { type ActivityPolymiddleware } from '../activityPolymiddleware';
import { type ErrorBoxPolymiddleware } from '../errorBoxPolymiddleware';

export type Polymiddleware = ActivityPolymiddleware | ErrorBoxPolymiddleware;
