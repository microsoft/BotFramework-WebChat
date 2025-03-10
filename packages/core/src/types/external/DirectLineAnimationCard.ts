import type { DirectLineMediaCardEssence } from './DirectLineMediaCardEssence';

// https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-cards.md#Animation-card
type DirectLineAnimationCard = DirectLineMediaCardEssence & {
  contentType: 'application/vnd.microsoft.card.animation';
};

export type { DirectLineAnimationCard };
