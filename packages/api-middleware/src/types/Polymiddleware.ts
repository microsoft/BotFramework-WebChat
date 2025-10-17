import { type ActivityPolymiddleware } from '../activityPolymiddleware';
import { type ChatLauncherButtonPolymiddleware } from '../chatLauncherButtonPolymiddleware';
import { type ErrorBoxPolymiddleware } from '../errorBoxPolymiddleware';
import { type IconButtonPolymiddleware } from '../iconButtonPolymiddleware';
import { type PopoverPolymiddleware } from '../popoverPolymiddleware';

export type Polymiddleware =
  | ActivityPolymiddleware
  | ChatLauncherButtonPolymiddleware
  | ErrorBoxPolymiddleware
  | IconButtonPolymiddleware
  | PopoverPolymiddleware;
