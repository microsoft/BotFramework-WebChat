import { SET_SEND_BOX_ATTACHMENTS } from '../actions/setSendBoxAttachments';
import { type SendBoxAttachment } from '../types/SendBoxAttachment';

const DEFAULT_STATE: readonly SendBoxAttachment[] = Object.freeze([]);

export default function sendBoxAttachments(state = DEFAULT_STATE, { payload, type }): readonly SendBoxAttachment[] {
  switch (type) {
    case SET_SEND_BOX_ATTACHMENTS:
      state = payload.attachments;
      break;

    default:
      break;
  }

  return state;
}
