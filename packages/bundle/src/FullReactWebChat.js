import * as adaptiveCards from 'adaptivecards';
import BasicWebChat, { concatMiddleware } from 'botframework-webchat-component';
import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import createAdaptiveCardsAttachmentMiddleware from './adaptiveCards/createAdaptiveCardMiddleware';
import renderMarkdown from './renderMarkdown';

// Add additional props to <WebChat>, so it support additional features
class FullReactWebChat extends React.Component {
  constructor(props) {
    super(props);

    const adaptiveCardsAttachmentMiddleware = createAdaptiveCardsAttachmentMiddleware({ adaptiveCards });

    this.createAttachmentMiddleware = memoize(middlewareFromProps => concatMiddleware(
      middlewareFromProps,
      adaptiveCardsAttachmentMiddleware
    ));
  }

  render() {
    const { attachmentMiddleware, ...otherProps } = this.props;

    return (
      <BasicWebChat
        attachmentMiddleware={ this.createAttachmentMiddleware(attachmentMiddleware) }
        renderMarkdown={ renderMarkdown }
        { ...otherProps }
      />
    );
  }
}

FullReactWebChat.defaultProps = {
  attachmentMiddleware: undefined
};

FullReactWebChat.propTypes = {
  attachmentMiddleware: PropTypes.func
};

export default FullReactWebChat
