import { type SendBoxAttachment } from '../types/SendBoxAttachment';

const SET_SEND_BOX_ATTACHMENTS = 'WEB_CHAT/SET_SEND_BOX_ATTACHMENTS';

export default function setSendBoxAttachments(attachments: readonly SendBoxAttachment[]) {
  return {
    type: SET_SEND_BOX_ATTACHMENTS,
    payload: { attachments }
  };
}

export { SET_SEND_BOX_ATTACHMENTS };
