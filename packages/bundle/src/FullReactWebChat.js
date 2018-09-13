import BasicWebChat, { createAdaptiveCardsAttachmentMiddleware } from 'component';
import memoize from 'memoize-one';

import renderMarkdown from './renderMarkdown';

// Add additional props to <WebChat>, so it support additional features
export default class extends React.Component {
  constructor(props) {
    super(props);

    this.createAttachmentMiddleware = memoize(middlewareFromProps => {
      const attachmentMiddleware = [];

      middlewareFromProps && attachmentMiddleware.push(middlewareFromProps);
      attachmentMiddleware.push(createAdaptiveCardsAttachmentMiddleware());

      return attachmentMiddleware;
    });
  }

  render() {
    const { props } = this;
    const attachmentMiddleware = this.createAttachmentMiddleware(props.attachmentMiddleware);

    return (
      <BasicWebChat
        attachmentMiddleware={ attachmentMiddleware }
        renderMarkdown={ renderMarkdown }
        { ...props }
      />
    );
  }
}
