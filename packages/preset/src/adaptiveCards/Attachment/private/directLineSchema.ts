import {
  any,
  array,
  boolean,
  literal,
  looseObject,
  number,
  object,
  optional,
  pipe,
  readonly,
  string,
  union
} from 'valibot';

// TODO: Should build a better `directLineCardActionSchema`.
const directLineCardActionSchema = pipe(
  looseObject({
    image: optional(string()),
    title: optional(string()),
    type: string(),
    value: optional(any())
  }),
  readonly()
);

// https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-cards.md#media-cards
const directLineMediaCardSchema = pipe(
  object({
    aspect: optional(union([literal('4:3'), literal('16:9')])),
    autoloop: optional(boolean()),
    autostart: optional(boolean()),
    buttons: optional(pipe(array(directLineCardActionSchema), readonly())),
    duration: optional(string()),
    // In the spec, "image" is of type "thumbnailUrl", which is simply a string.
    image: optional(
      pipe(
        object({
          url: string()
        }),
        readonly()
      )
    ),
    media: pipe(array(pipe(object({ profile: optional(string()), url: string() }), readonly())), readonly()),
    shareable: optional(boolean()),
    subtitle: optional(string()),
    text: optional(string()), // TODO: Media cards should not have `text` field.
    title: optional(string()),
    value: optional(any())
  }),
  readonly()
);

// https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-cards.md#basic-cards
const directLineBasicCardSchema = pipe(
  object({
    buttons: optional(pipe(array(directLineCardActionSchema), readonly())),
    images: optional(
      pipe(
        array(
          pipe(
            object({
              alt: optional(string()),
              tap: optional(directLineCardActionSchema),
              url: optional(string())
            }),
            readonly()
          )
        ),
        readonly()
      )
    ),
    subtitle: optional(string()),
    tap: optional(directLineCardActionSchema),
    text: optional(string()),
    title: optional(string())
  }),
  readonly()
);

// https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-cards.md#receipt-card
const directLineReceiptCardSchema = pipe(
  object({
    buttons: optional(pipe(array(any()), readonly())),
    facts: optional(
      pipe(
        array(
          pipe(
            object({
              key: optional(string()),
              value: optional(string())
            }),
            readonly()
          )
        ),
        readonly()
      )
    ),
    items: optional(
      pipe(
        array(
          pipe(
            object({
              image: optional(
                pipe(
                  object({
                    alt: string(),
                    tap: optional(directLineCardActionSchema),
                    url: string()
                  }),
                  readonly()
                )
              ),
              price: string(),
              quantity: optional(union([number(), string()])), // TODO: Should be string only.
              subtitle: optional(string()),
              tap: optional(directLineCardActionSchema),
              text: optional(string()),
              title: string()
            }),
            readonly()
          )
        ),
        readonly()
      )
    ),
    tap: optional(directLineCardActionSchema),
    tax: optional(string()),
    title: optional(string()),
    total: optional(string()),
    vat: optional(string())
  }),
  readonly()
);

// https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-cards.md#Signin-card
const directLineSignInCardSchema = pipe(
  object({
    buttons: pipe(array(directLineCardActionSchema), readonly()),
    text: optional(string())
  }),
  readonly()
);

export {
  directLineBasicCardSchema,
  directLineCardActionSchema,
  directLineMediaCardSchema,
  directLineReceiptCardSchema,
  directLineSignInCardSchema
};
