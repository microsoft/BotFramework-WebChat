import type { DirectLineMediaCardEssence } from './DirectLineMediaCardEssence';

// https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-cards.md#video-card
type DirectLineVideoCard = DirectLineMediaCardEssence & {
  contentType: 'application/vnd.microsoft.card.video';
};

export type { DirectLineVideoCard };
