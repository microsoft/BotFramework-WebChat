import {
  blob,
  check,
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
        check(url => url.protocol === 'data:', 'Scheme of the supplied URL must be of type "data:"')
      )
    )
  }),
  readonly()
);

type SendBoxAttachment = InferOutput<typeof sendBoxAttachmentSchema>;

export { sendBoxAttachmentSchema, type SendBoxAttachment };
