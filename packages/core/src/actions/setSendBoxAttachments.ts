import { array, literal, object, parse, pipe, readonly, type InferOutput } from 'valibot';

import { sendBoxAttachmentSchema, type SendBoxAttachment } from '../types/SendBoxAttachment';

const SET_SEND_BOX_ATTACHMENTS = 'WEB_CHAT/SET_SEND_BOX_ATTACHMENTS' as const;

const setSendBoxAttachmentsActionSchema = pipe(
  object({
    payload: pipe(array(sendBoxAttachmentSchema), readonly()),
    type: literal(SET_SEND_BOX_ATTACHMENTS)
  }),
  readonly()
);

type SetSendBoxAttachmentsAction = InferOutput<typeof setSendBoxAttachmentsActionSchema>;

function setSendBoxAttachments(attachments: readonly SendBoxAttachment[]) {
  return parse(setSendBoxAttachmentsActionSchema, {
    payload: attachments,
    type: SET_SEND_BOX_ATTACHMENTS
  });
}

export default setSendBoxAttachments;
export { SET_SEND_BOX_ATTACHMENTS, setSendBoxAttachmentsActionSchema, type SetSendBoxAttachmentsAction };
