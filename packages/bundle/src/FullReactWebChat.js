import BasicWebChat from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import AdaptiveCardsComposer from './adaptiveCards/AdaptiveCardsComposer';
import useComposerProps from './useComposerProps';

// Add additional props to <WebChat>, so it support additional features
const FullReactWebChat = props => {
  const { adaptiveCardHostConfig, adaptiveCardsHostConfig, adaptiveCardsPackage, ...otherProps } = props;

  useEffect(() => {
    adaptiveCardHostConfig &&
      console.warn(
        'Web Chat: "adaptiveCardHostConfig" is deprecated. Please use "adaptiveCardsHostConfig" instead. "adaptiveCardHostConfig" will be removed on or after 2022-01-01.'
      );
  }, [adaptiveCardHostConfig]);

  const composerProps = useComposerProps(props);

  return (
    <AdaptiveCardsComposer
      adaptiveCardsHostConfig={adaptiveCardHostConfig || adaptiveCardsHostConfig}
      adaptiveCardsPackage={adaptiveCardsPackage}
    >
      <BasicWebChat {...otherProps} {...composerProps} />
    </AdaptiveCardsComposer>
  );
};

FullReactWebChat.defaultProps = {
  ...BasicWebChat.defaultProps,
  adaptiveCardHostConfig: undefined,
  adaptiveCardsHostConfig: undefined,
  adaptiveCardsPackage: undefined,
  renderMarkdown: undefined
};

FullReactWebChat.propTypes = {
  ...BasicWebChat.propTypes,
  adaptiveCardHostConfig: PropTypes.any,
  adaptiveCardsHostConfig: PropTypes.any,
  adaptiveCardsPackage: PropTypes.any,
  renderMarkdown: PropTypes.func
};

export default FullReactWebChat;
