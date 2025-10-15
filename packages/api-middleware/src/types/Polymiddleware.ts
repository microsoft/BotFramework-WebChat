import { type ActivityPolymiddleware } from '../activityPolymiddleware';
import { type ChatLauncherButtonPolymiddleware } from '../chatLauncherButtonPolymiddleware';
import { type ErrorBoxPolymiddleware } from '../errorBoxPolymiddleware';

export type Polymiddleware = ActivityPolymiddleware | ChatLauncherButtonPolymiddleware | ErrorBoxPolymiddleware;
