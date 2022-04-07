import type { DirectLineCardAction } from './DirectLineCardAction';

// https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-cards.md#media-cards
type DirectLineMediaCardEssence = {
  aspect?: '4:3' | '16:9';
  autoloop?: boolean;
  autostart?: boolean;
  buttons?: DirectLineCardAction[];
  duration?: string;
  // In the spec, "image" is of type "thumbnailUrl", which is simply a string.
  image?: { url: string };
  media: { profile?: string; url: string }[];
  shareable?: boolean;
  subtitle?: string;
  title?: string;
  value?: any;
};

export type { DirectLineMediaCardEssence };
