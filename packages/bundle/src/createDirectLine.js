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
  webSocket,
  conversationStartLocale
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
    conversationStartLocale,
    createFormData: attachments => {
      const formData = new FormData();

      attachments.forEach(({ contentType, data, filename, name }) => {
        formData.append(name, new Blob(data, { contentType }), filename);
      });

      return formData;
    }
  });
}
