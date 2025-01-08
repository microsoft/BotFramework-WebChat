import { type SendBoxAttachment } from '../types/SendBoxAttachment';
import { type ReduxState } from '../types/internal/ReduxState';

export default function sendBoxAttachments({ sendBoxAttachments }: ReduxState): readonly SendBoxAttachment[] {
  return sendBoxAttachments;
}
