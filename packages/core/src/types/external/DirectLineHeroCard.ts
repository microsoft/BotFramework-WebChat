import type { DirectLineBasicCardEssence } from './DirectLineBasicCardEssence';

// https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-cards.md#Hero-cards
type DirectLineHeroCard = DirectLineBasicCardEssence & {
  contentType: 'application/vnd.microsoft.card.hero';
};

export type { DirectLineHeroCard };
