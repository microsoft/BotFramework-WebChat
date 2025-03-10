import type { DirectLineBasicCardEssence } from './DirectLineBasicCardEssence';

// https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-cards.md#Thumbnail-cards
type DirectLineThumbnailCard = DirectLineBasicCardEssence & {
  contentType: 'application/vnd.microsoft.card.thumbnail';
};

export type { DirectLineThumbnailCard };
