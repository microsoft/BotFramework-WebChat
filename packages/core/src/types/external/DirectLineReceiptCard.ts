import type { DirectLineCardAction } from './DirectLineCardAction';
import type { DirectLineCardImage } from './DirectLineCardImage';

type Fact = {
  key?: string;
  value?: string;
};

type ReceiptItem = {
  image?: DirectLineCardImage;
  price?: string;
  quantity?: string;
  subtitle?: string;
  tap?: DirectLineCardAction;
  text?: string;
  title?: string;
};

// https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-cards.md#receipt-card
type DirectLineReceiptCard = {
  buttons?: DirectLineCardAction[];
  contentType: 'application/vnd.microsoft.card.receipt';
  facts?: Fact[];
  items?: ReceiptItem[];
  tap?: DirectLineCardAction;
  tax?: string;
  title?: string;
  total?: string;
  vat?: string;
};

export type { DirectLineReceiptCard };
