import { type InferInput, instance, object, optional, pipe, readonly, union } from 'valibot';

const sendBoxAttachmentSchema = pipe(
  object({
    blob: union([instance(Blob), instance(File)]),
    thumbnailURL: optional(instance(URL))
  }),
  readonly()
);

type SendBoxAttachment = InferInput<typeof sendBoxAttachmentSchema>;

export { sendBoxAttachmentSchema, type SendBoxAttachment };
