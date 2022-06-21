import type { DirectLineCardAction } from './DirectLineCardAction';

type DirectLineOAuthCard = {
  buttons?: DirectLineCardAction[];
  contentType: 'application/vnd.microsoft.card.oauth';
  text?: string;
};

export type { DirectLineOAuthCard };
