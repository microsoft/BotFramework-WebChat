import { type ActivityPolymiddleware } from '../activityPolymiddleware';
import { type ButtonPolymiddleware } from '../buttonPolymiddleware';
import { type ChatLauncherButtonPolymiddleware } from '../chatLauncherButtonPolymiddleware';
import { type ErrorBoxPolymiddleware } from '../errorBoxPolymiddleware';
import { type PopoverPolymiddleware } from '../popoverPolymiddleware';

export type Polymiddleware =
  | ActivityPolymiddleware
  | ButtonPolymiddleware
  | ChatLauncherButtonPolymiddleware
  | ErrorBoxPolymiddleware
  | PopoverPolymiddleware;
