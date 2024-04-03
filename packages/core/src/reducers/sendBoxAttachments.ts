import { SET_SEND_BOX_ATTACHMENTS } from '../actions/setSendBoxAttachments';

const DEFAULT_STATE: readonly Blob[] = Object.freeze([]);

export default function sendBoxAttachments(state = DEFAULT_STATE, { payload, type }): readonly Blob[] {
  switch (type) {
    case SET_SEND_BOX_ATTACHMENTS:
      state = payload.attachments;
      break;

    default:
      break;
  }

  return state;
}
