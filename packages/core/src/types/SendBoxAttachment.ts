import { blob, file, instance, object, optional, pipe, readonly, union, type InferOutput } from 'valibot';

const sendBoxAttachmentSchema = pipe(
  object({
    blob: union([blob(), file()]),
    thumbnailURL: optional(instance(URL))
  }),
  readonly()
);

type SendBoxAttachment = InferOutput<typeof sendBoxAttachmentSchema>;

export { sendBoxAttachmentSchema, type SendBoxAttachment };
