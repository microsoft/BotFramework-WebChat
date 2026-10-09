import {
  undefined_,
  intersect,
  literal,
  object,
  optional,
  pipe,
  readonly,
  record,
  string,
  union,
  unknown,
  variant,
  type InferOutput
} from 'valibot';

const cardActionWithImageAndTitleEssenceSchema = union([
  object({ image: string(), title: string() }),
  object({ image: string(), title: optional(undefined_()) }),
  object({ image: optional(undefined_()), title: string() })
]);

// const cardActionWithImageAndTitleSchema = pipe(
//   object({ image: optional(string()), title: optional(string()) }),
//   check(value => !!(value.image || value.title), 'CardAction must have either "image" or "title" property set')
// );

/**
 * A `call` action represents a telephone number that may be called.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#call
 */
const callCardActionEssenceSchema = object({ type: literal('call'), value: string() });

/**
 * A `downloadFile` action represents a hyperlink to be downloaded.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#download-file-actions
 */
const downloadFileCardActionEssenceSchema = object({ type: literal('downloadFile'), value: string() });

/**
 * An `imBack` action represents a text response that is added to the chat feed.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#im-back
 */
const imBackCardActionEssenceSchema = object({ type: literal('imBack'), value: string() });

/**
 * A `messageBack` action represents a text response to be sent via the chat system.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#message-back
 */
const messageBackCardActionEssenceSchema = object({
  displayText: optional(string()),
  text: optional(string()),
  type: literal('messageBack'),
  value: optional(record(string(), unknown()))
});

/**
 * An `openUrl` action represents a hyperlink to be handled by the client.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#open-url-actions
 */
const openURLCardActionEssenceSchema = object({ type: literal('openUrl'), value: string() });

/**
 * A `playAudio` action represents audio media that may be played.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#play-audio
 */
const playAudioCardActionEssenceSchema = object({ type: literal('playAudio'), value: string() });

/**
 * A `playVideo` action represents video media that may be played.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#play-video
 */
const playVideoCardActionEssenceSchema = object({ type: literal('playVideo'), value: string() });

/**
 * A `postBack` action represents a text response that is not added to the chat feed.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#post-back
 */
const postBackCardActionEssenceSchema = object({ type: literal('postBack'), value: unknown() });

/**
 * A `showImage` action represents an image that may be displayed.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#show-image-file-actions
 */
const showImageCardActionEssenceSchema = object({ type: literal('showImage'), value: string() });

/**
 * A `signin` action represents a hyperlink to be handled by the client's signin system.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#signin
 */
const signInCardActionEssenceSchema = object({ type: literal('signin'), value: string() });

/**
 * Web Chat-only `webchat:callURL` action represents a hyperlink opened in a popup window.
 */
const webChatCallURLCardActionEssenceSchema = object({ type: literal('webchat:callURL'), value: string() });

/**
 * A card action represents a clickable or interactive button for use within cards or as suggested actions. They are used to solicit input from users. Despite their name, card actions are not limited to use solely on cards.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#card-action
 */
const directLineCardActionSchema = pipe(
  intersect([
    cardActionWithImageAndTitleEssenceSchema,
    variant('type', [
      callCardActionEssenceSchema,
      downloadFileCardActionEssenceSchema,
      imBackCardActionEssenceSchema,
      messageBackCardActionEssenceSchema,
      openURLCardActionEssenceSchema,
      playAudioCardActionEssenceSchema,
      playVideoCardActionEssenceSchema,
      postBackCardActionEssenceSchema,
      showImageCardActionEssenceSchema,
      signInCardActionEssenceSchema,
      webChatCallURLCardActionEssenceSchema
    ])
  ]),
  readonly()
);

type DirectLineCardAction = InferOutput<typeof directLineCardActionSchema>;

export default directLineCardActionSchema;
export { type DirectLineCardAction };
