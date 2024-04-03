import type { ReduxState } from '../types/internal/ReduxState';

export default function sendBoxAttachments({ sendBoxAttachments }: ReduxState): readonly Blob[] {
  return sendBoxAttachments;
}
