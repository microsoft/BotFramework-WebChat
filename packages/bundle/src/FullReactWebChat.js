import BasicWebChat, { concatMiddleware } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo } from 'react';

import AdaptiveCardsComposer from './adaptiveCards/AdaptiveCardsComposer';
import createAdaptiveCardsAttachmentMiddleware from './adaptiveCards/createAdaptiveCardsAttachmentMiddleware';
import createAdaptiveCardsStyleSet from './adaptiveCards/Styles/createAdaptiveCardsStyleSet';
import defaultRenderMarkdown from './renderMarkdown';

// Add additional props to <WebChat>, so it support additional features
const FullReactWebChat = ({
  adaptiveCardHostConfig,
  adaptiveCardsHostConfig,
  adaptiveCardsPackage,
  attachmentMiddleware,
  renderMarkdown,
  styleOptions,
  ...otherProps
}) => {
  useEffect(() => {
    adaptiveCardHostConfig &&
      console.warn(
        'Web Chat: "adaptiveCardHostConfig" is deprecated. Please use "adaptiveCardsHostConfig" instead. "adaptiveCardHostConfig" will be removed on or after 2022-01-01.'
      );
  }, [adaptiveCardHostConfig]);

  const patchedAttachmentMiddleware = useMemo(
    () => concatMiddleware(attachmentMiddleware, createAdaptiveCardsAttachmentMiddleware()),
    [attachmentMiddleware]
  );

  const extraStyleSet = useMemo(() => createAdaptiveCardsStyleSet(styleOptions), [styleOptions]);

  return (
    <AdaptiveCardsComposer
      adaptiveCardsHostConfig={adaptiveCardsHostConfig}
      adaptiveCardsPackage={adaptiveCardsPackage}
    >
      <BasicWebChat
        attachmentMiddleware={patchedAttachmentMiddleware}
        extraStyleSet={extraStyleSet}
        renderMarkdown={renderMarkdown || defaultRenderMarkdown}
        {...otherProps}
      />
    </AdaptiveCardsComposer>
  );
};

FullReactWebChat.defaultProps = {
  ...BasicWebChat.defaultProps,
  adaptiveCardHostConfig: undefined,
  adaptiveCardsHostConfig: undefined,
  adaptiveCardsPackage: undefined,
  attachmentMiddleware: undefined,
  renderMarkdown: undefined,
  styleOptions: undefined
};

FullReactWebChat.propTypes = {
  ...BasicWebChat.propTypes,
  adaptiveCardHostConfig: PropTypes.any,
  adaptiveCardsHostConfig: PropTypes.any,
  adaptiveCardsPackage: PropTypes.any,
  attachmentMiddleware: PropTypes.func,
  renderMarkdown: PropTypes.func,
  styleOptions: PropTypes.any
};

export default FullReactWebChat;
