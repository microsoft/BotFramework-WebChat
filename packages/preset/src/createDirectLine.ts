import { DirectLine } from 'botframework-directlinejs';

type CreateDirectLineOptions = {
  botAgent?: string;
  conversationId?: string;
  conversationStartProperties?: any;
  domain?: string;
  fetch?: typeof window.fetch;
  pollingInterval?: number;
  secret?: string;
  streamUrl?: string;
  token?: string;
  watermark?: string;
  webSocket?: typeof WebSocket;
};

export default function createDirectLine({
  botAgent,
  conversationId,
  conversationStartProperties,
  domain,
  fetch,
  pollingInterval,
  secret,
  streamUrl,
  token,
  watermark,
  webSocket
}: CreateDirectLineOptions) {
  // TODO: [P3] Checks if DLJS supports ponyfilling fetch.
  return new DirectLine({
    botAgent,
    conversationId,
    conversationStartProperties,
    domain,
    fetch,
    pollingInterval,
    secret,
    streamUrl,
    token,
    watermark,
    webSocket,
    createFormData: attachments => {
      const formData = new FormData();

      attachments.forEach(
        ({
          contentType,
          data,
          filename,
          name
        }: {
          contentType?: string;
          data: BlobPart[];
          filename?: string;
          name?: string;
        }) => {
          formData.append(name, new Blob(data, { type: contentType }), filename);
        }
      );

      return formData;
    }
  } as any);
}
