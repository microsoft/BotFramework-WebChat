import { DirectLine } from 'botframework-directlinejs';

export default function ({ domain, fetch, secret, token, webSocket, conversationId }) {
  return new DirectLine({
    domain,
    fetch,
    secret,
    token,
    webSocket,
    conversationId,
    createFormData: attachments => {
      const formData = new FormData();

      attachments.forEach(({ contentType, data, filename, name }) => {
        formData.append(name, new Blob(data, { contentType }), filename);
      });

      return formData;
    }
  });
}
