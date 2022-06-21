import type { DirectLineCardImage } from './DirectLineCardImage';
import type { DirectLineCardAction } from './DirectLineCardAction';

// https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-cards.md#basic-cards
type DirectLineBasicCardEssence = {
  buttons?: DirectLineCardAction[];
  images?: DirectLineCardImage[];
  subtitle?: string;
  tap?: DirectLineCardAction;
  text?: string;
  title?: string;
};

export type { DirectLineBasicCardEssence };
