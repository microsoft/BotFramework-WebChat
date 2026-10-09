import {
  intersect,
  literal,
  object,
  optional,
  pipe,
  readonly,
  record,
  string,
  undefined_,
  union,
  unknown,
  variant,
  type InferOutput
} from 'valibot';

// TODO: [P0] We should rebuild this schema into a stricter one that follows Direct Line spec.

const cardActionWithImageAndTitleEssenceSchema = union([
  pipe(object({ image: string(), imageAltText: optional(string()), title: string() }), readonly()),
  pipe(object({ image: string(), imageAltText: optional(string()), title: optional(undefined_()) }), readonly()),
  pipe(object({ image: optional(undefined_()), imageAltText: optional(undefined_()), title: string() }), readonly())
]);

/**
 * A `call` action represents a telephone number that may be called.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#call
 */
const callCardActionEssenceSchema = pipe(object({ type: literal('call'), value: string() }), readonly());

/**
 * A `downloadFile` action represents a hyperlink to be downloaded.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#download-file-actions
 */
const downloadFileCardActionEssenceSchema = pipe(
  object({ type: literal('downloadFile'), value: string() }),
  readonly()
);

/**
 * An `imBack` action represents a text response that is added to the chat feed.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#im-back
 */
const imBackCardActionEssenceSchema = pipe(object({ type: literal('imBack'), value: string() }), readonly());

/**
 * A `messageBack` action represents a text response to be sent via the chat system.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#message-back
 */
const messageBackCardActionEssenceSchema = pipe(
  object({
    displayText: optional(string()),
    text: optional(string()),
    type: literal('messageBack'),
    value: optional(record(string(), unknown()))
  }),
  readonly()
);

/**
 * An `openUrl` action represents a hyperlink to be handled by the client.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#open-url-actions
 */
const openURLCardActionEssenceSchema = pipe(object({ type: literal('openUrl'), value: string() }), readonly());

/**
 * A `playAudio` action represents audio media that may be played.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#play-audio
 */
const playAudioCardActionEssenceSchema = pipe(object({ type: literal('playAudio'), value: string() }), readonly());

/**
 * A `playVideo` action represents video media that may be played.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#play-video
 */
const playVideoCardActionEssenceSchema = pipe(object({ type: literal('playVideo'), value: string() }), readonly());

/**
 * A `postBack` action represents a text response that is not added to the chat feed.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#post-back
 */
const postBackCardActionEssenceSchema = pipe(object({ type: literal('postBack'), value: unknown() }), readonly());

/**
 * A `showImage` action represents an image that may be displayed.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#show-image-file-actions
 */
const showImageCardActionEssenceSchema = pipe(object({ type: literal('showImage'), value: string() }), readonly());

/**
 * A `signin` action represents a hyperlink to be handled by the client's signin system.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#signin
 */
const signInCardActionEssenceSchema = pipe(object({ type: literal('signin'), value: string() }), readonly());

/**
 * Web Chat-only `webchat:callURL` action represents a hyperlink opened in a popup window.
 */
const webChatCallURLCardActionEssenceSchema = pipe(
  object({ type: literal('webchat:callURL'), value: string() }),
  readonly()
);

/**
 * > This headless card action is intended for tap action only.
 *
 * A card action represents a clickable or interactive button for use within cards or as suggested actions. They are used to solicit input from users. Despite their name, card actions are not limited to use solely on cards.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#card-action
 */
const directLineHeadlessCardActionSchema = variant('type', [
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
]);

/**
 * A card action represents a clickable or interactive button for use within cards or as suggested actions. They are used to solicit input from users. Despite their name, card actions are not limited to use solely on cards.
 *
 * https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#card-action
 */
const directLineCardActionSchema = intersect([
  cardActionWithImageAndTitleEssenceSchema,
  directLineHeadlessCardActionSchema
]);

type DirectLineCardAction = InferOutput<typeof directLineCardActionSchema>;

export default directLineCardActionSchema;
export { directLineHeadlessCardActionSchema, type DirectLineCardAction };
