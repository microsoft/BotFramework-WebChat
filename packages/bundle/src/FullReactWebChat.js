import * as adaptiveCards from 'adaptivecards';
import BasicWebChat, { concatMiddleware } from 'botframework-webchat-component';
import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import createAdaptiveCardsAttachmentMiddleware from './adaptiveCards/createAdaptiveCardMiddleware';
import createStyleSet from './adaptiveCards/Styles/createStyleSetWithAdaptiveCards';
import defaultAdaptiveCardHostConfig from './adaptiveCards/Styles/adaptiveCardHostConfig';
import renderMarkdown from './renderMarkdown';

// Add additional props to <WebChat>, so it support additional features
class FullReactWebChat extends React.Component {
  constructor(props) {
    super(props);

    this.createAttachmentMiddleware = memoize((adaptiveCardHostConfig, middlewareFromProps, styleOptions) =>
      concatMiddleware(
        middlewareFromProps,
        createAdaptiveCardsAttachmentMiddleware({
          adaptiveCardHostConfig: adaptiveCardHostConfig || defaultAdaptiveCardHostConfig(styleOptions),
          adaptiveCards
        })
      )
    );
  }

  render() {
    const { adaptiveCardHostConfig, attachmentMiddleware, styleOptions, styleSet, ...otherProps } = this.props;

    return (
      <BasicWebChat
        attachmentMiddleware={this.createAttachmentMiddleware(
          adaptiveCardHostConfig,
          attachmentMiddleware,
          styleOptions
        )}
        renderMarkdown={renderMarkdown}
        styleOptions={styleOptions}
        styleSet={styleSet || createStyleSet(styleOptions)}
        {...otherProps}
      />
    );
  }
}

FullReactWebChat.defaultProps = {
  adaptiveCardHostConfig: undefined,
  attachmentMiddleware: undefined,
  styleOptions: undefined,
  styleSet: undefined
};

FullReactWebChat.propTypes = {
  adaptiveCardHostConfig: PropTypes.any,
  attachmentMiddleware: PropTypes.func,
  styleOptions: PropTypes.any,
  styleSet: PropTypes.any
};

export default FullReactWebChat;
