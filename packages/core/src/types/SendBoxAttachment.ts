import {
  blob,
  check,
  fallback,
  file,
  instance,
  object,
  optional,
  pipe,
  readonly,
  string,
  transform,
  union,
  url,
  type InferOutput
} from 'valibot';

const sendBoxAttachmentSchema = pipe(
  object({
    blob: union([blob(), file()]),
    thumbnailURL: optional(
      pipe(
        union([
          instance(URL),
          // `thumbnailURL` should be solely of type URL but never a string.
          // But for historic reason, we need to allow string() + url().
          pipe(
            string(),
            url(),
            transform(value => new URL(value))
          )
        ]),
        transform(url => {
          if (url.protocol === 'data:') {
            return url;
          }

          console.warn(
            'botframework-webchat: `SendBoxAttachment.thumbnailURL` must be a data URI, ignoring the value.'
          );

          return undefined;
        })
      )
    )
  }),
  readonly()
);

type SendBoxAttachment = InferOutput<typeof sendBoxAttachmentSchema>;

export { sendBoxAttachmentSchema, type SendBoxAttachment };
