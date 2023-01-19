// Type definitions here are from https://github.com/microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-cards.md#Card-image.

import type { DirectLineCardAction } from './DirectLineCardAction';

/**
 * Card images are used to display image content within [Hero cards](./DirectLineHeroCard.ts) and [Thumbnail cards](./DirectLineThumbnailCard.ts).
 */
type DirectLineCardImage = {
  /** The `alt` field contains equivalent content for clients that cannot process images or have not yet loaded the image. The value of the `alt` field is a string. */
  alt: string;

  /** The `tap` field contains an action to be activated if the user taps on an image or associated framing. The value of the `tap` field is of type [cardAction](./DirectLineCardAction.ts). */
  tap?: DirectLineCardAction;

  /** The `url` field references image content to be displayed within a card. Data URIs, as defined in [RFC 2397](https://tools.ietf.org/html/rfc2397) are typically supported by channels. The value of the `url` field is of type string. */
  url: string;
};

export type { DirectLineCardImage };
