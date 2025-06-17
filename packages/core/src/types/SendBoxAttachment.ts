import {
  blob,
  custom,
  file,
  instance,
  object,
  optional,
  pipe,
  readonly,
  safeParse,
  transform,
  union,
  type InferOutput
} from 'valibot';

const sendBoxAttachmentSchema = pipe(
  object({
    blob: union([blob(), file()]),
    thumbnailURL: optional(
      pipe(
        custom<URL>(value => safeParse(instance(URL), value).success),
        transform(value => new URL(value))
      )
    )
  }),
  readonly()
);

type SendBoxAttachment = InferOutput<typeof sendBoxAttachmentSchema>;

export { sendBoxAttachmentSchema, type SendBoxAttachment };
