type CardActionWithImageAndTitle =
  | { image: string }
  | { title: string }
  | {
      image: string;
      title: string;
    };

/**
 * A `call` action represents a telephone number that may be called.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#call
 */
type CallCardAction = CardActionWithImageAndTitle & {
  type: 'call';
  value: string;
};

/**
 * A `downloadFile` action represents a hyperlink to be downloaded.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#download-file-actions
 */
type DownloadFileCardAction = CardActionWithImageAndTitle & {
  type: 'downloadFile';
  value: string;
};

/**
 * An `imBack` action represents a text response that is added to the chat feed.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#im-back
 */
type IMBackCardAction = CardActionWithImageAndTitle & {
  type: 'imBack';
  value: string;
};

/**
 * A `messageBack` action represents a text response to be sent via the chat system.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#message-back
 */
type MessageBackCardAction = CardActionWithImageAndTitle & {
  displayText?: string;
  text?: string;
  type: 'messageBack';
  value?: { [key: string]: any };
};

/**
 * An `openUrl` action represents a hyperlink to be handled by the client.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#open-url-actions
 */
type OpenURLCardAction = CardActionWithImageAndTitle & {
  type: 'openUrl';
  value: string;
};

/**
 * A `playAudio` action represents audio media that may be played.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#play-audio
 */
type PlayAudioCardAction = CardActionWithImageAndTitle & {
  type: 'playAudio';
  value: string;
};

/**
 * A `playVideo` action represents video media that may be played.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#play-video
 */
type PlayVideoCardAction = CardActionWithImageAndTitle & {
  type: 'playVideo';
  value: string;
};

/**
 * A `postBack` action represents a text response that is not added to the chat feed.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#post-back
 */
type PostBackCardAction = CardActionWithImageAndTitle & {
  type: 'postBack';
  value: any; // For legacy reason, postBack support any.
};

/**
 * A `showImage` action represents an image that may be displayed.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#show-image-file-actions
 */
type ShowImageCardAction = CardActionWithImageAndTitle & {
  type: 'showImage';
  value: string;
};

/**
 * A `signin` action represents a hyperlink to be handled by the client's signin system.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#signin
 */
type SignInCardAction = CardActionWithImageAndTitle & {
  type: 'signin';
  value: string;
};

/**
 * A card action represents a clickable or interactive button for use within cards or as suggested actions. They are used to solicit input from users. Despite their name, card actions are not limited to use solely on cards.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#card-action
 */
type DirectLineCardAction =
  | CallCardAction
  | DownloadFileCardAction
  | IMBackCardAction
  | MessageBackCardAction
  | OpenURLCardAction
  | PlayAudioCardAction
  | PlayVideoCardAction
  | PostBackCardAction
  | ShowImageCardAction
  | SignInCardAction;

export type { DirectLineCardAction };
