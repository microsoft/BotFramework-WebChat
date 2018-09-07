import { DirectLine } from 'botframework-directlinejs';

export default function ({ domain, fetch, token, webSocket }) {
  return new DirectLine({
    domain,
    fetch,
    token,
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
