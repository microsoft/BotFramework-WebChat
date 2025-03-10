import type { DirectLineCardAction } from './DirectLineCardAction';

// https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-cards.md#Signin-card
type DirectLineSignInCard = {
  buttons?: DirectLineCardAction[];
  contentType: 'application/vnd.microsoft.card.signin';
  text?: string;
};

export type { DirectLineSignInCard };
