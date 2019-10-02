import { DirectLine } from 'botframework-directlinejs';

export default function createDirectLine({
  botAgent,
  conversationId,
  domain,
  fetch,
  pollingInterval,
  secret,
  streamUrl,
  token,
  watermark,
  webSocket
}) {
  return new DirectLine({
    botAgent,
    conversationId,
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

      attachments.forEach(({ contentType, data, filename, name }) => {
        formData.append(name, new Blob(data, { contentType }), filename);
      });

      return formData;
    }
  });
}
