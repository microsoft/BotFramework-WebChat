import DirectLine from 'botframework-directlinejs';

export default function createDirectLine(options) {
  return new DirectLine({
    fetch: window.fetch,
    createFormData: attachments => {
        const formData = new FormData();

        attachments.forEach(attachment => {
            formData.append(attachment.name, new Blob(attachment.data, attachment.options));
        });

        return formData;
    },
    ...options
  });
}
