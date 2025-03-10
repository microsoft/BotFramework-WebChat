import type { DirectLineMediaCardEssence } from './DirectLineMediaCardEssence';

// https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-cards.md#audio-card
type DirectLineAudioCard = DirectLineMediaCardEssence & {
  contentType: 'application/vnd.microsoft.card.audio';
};

export type { DirectLineAudioCard };
