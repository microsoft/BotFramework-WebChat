import * as adaptiveCards from 'adaptivecards';
import BasicWebChat, { concatMiddleware } from 'botframework-webchat-component';
import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import createAdaptiveCardsAttachmentMiddleware from './adaptiveCards/createAdaptiveCardMiddleware';
import createStyleSet from './adaptiveCards/Styles/createStyleSetWithAdaptiveCards';
import defaultAdaptiveCardHostConfig from './adaptiveCards/Styles/adaptiveCardHostConfig';
import defaultRenderMarkdown from './renderMarkdown';

// Add additional props to <WebChat>, so it support additional features
class FullReactWebChat extends React.Component {
  constructor(props) {
    super(props);

    this.createAttachmentMiddleware = memoize(
      (adaptiveCardHostConfig, middlewareFromProps, styleOptions, renderMarkdown) =>
        concatMiddleware(
          middlewareFromProps,
          createAdaptiveCardsAttachmentMiddleware({
            adaptiveCardHostConfig: adaptiveCardHostConfig || defaultAdaptiveCardHostConfig(styleOptions),
            adaptiveCards,
            renderMarkdown
          })
        )
    );

    this.memoizeStyleSet = memoize((styleSet, styleOptions) => styleSet || createStyleSet(styleOptions));
    this.memoizeRenderMarkdown = memoize((renderMarkdown, { options }) => markdown =>
      renderMarkdown(markdown, options)
    );
  }

  render() {
    const {
      adaptiveCardHostConfig,
      attachmentMiddleware,
      renderMarkdown,
      styleOptions,
      styleSet,
      ...otherProps
    } = this.props;

    const memoizedStyleSet = this.memoizeStyleSet(styleSet, styleOptions);
    const memoizedRenderMarkdown =
      renderMarkdown || this.memoizeRenderMarkdown(defaultRenderMarkdown, memoizedStyleSet);

    return (
      <BasicWebChat
        attachmentMiddleware={this.createAttachmentMiddleware(
          adaptiveCardHostConfig,
          attachmentMiddleware,
          styleOptions,
          memoizedRenderMarkdown
        )}
        renderMarkdown={memoizedRenderMarkdown}
        styleOptions={styleOptions}
        styleSet={memoizedStyleSet}
        {...otherProps}
      />
    );
  }
}

FullReactWebChat.defaultProps = {
  adaptiveCardHostConfig: undefined,
  attachmentMiddleware: undefined,
  renderMarkdown: undefined,
  styleOptions: undefined,
  styleSet: undefined
};

FullReactWebChat.propTypes = {
  adaptiveCardHostConfig: PropTypes.any,
  attachmentMiddleware: PropTypes.func,
  renderMarkdown: PropTypes.func,
  styleOptions: PropTypes.any,
  styleSet: PropTypes.any
};

export default FullReactWebChat;
