import type { WebChatPostActivityAttachment } from '../types/WebChatPostActivityAttachment';

const SEND_FILES = 'WEB_CHAT/SEND_FILES';

// TODO: [P1] We could obsolete this or dispatch { type: SEND_MESSAGE } insetad.
export default function sendFiles(files: readonly WebChatPostActivityAttachment[]) {
  return {
    type: SEND_FILES,
    payload: { files }
  };
}

export { SEND_FILES };
