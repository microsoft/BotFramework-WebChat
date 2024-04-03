import { type WebChatPostActivityAttachment } from '../types/WebChatPostActivityAttachment';

const SEND_MESSAGE = 'WEB_CHAT/SEND_MESSAGE';

export default function sendMessage(
  text: string | undefined,
  method: string | undefined,
  { attachments, channelData }: { attachments?: readonly WebChatPostActivityAttachment[]; channelData?: any } = {}
) {
  return {
    type: SEND_MESSAGE,
    payload: { attachments, channelData, method, text }
  };
}

export { SEND_MESSAGE };
