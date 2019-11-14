import * as defaultAdaptiveCardsPackage from 'adaptivecards';
import BasicWebChat, { concatMiddleware } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo } from 'react';

import AdaptiveCardsContext from './adaptiveCards/AdaptiveCardsContext';
import createAdaptiveCardsAttachmentMiddleware from './adaptiveCards/createAdaptiveCardMiddleware';
import createDefaultAdaptiveCardHostConfig from './adaptiveCards/Styles/adaptiveCardHostConfig';
import createStyleSet from './adaptiveCards/Styles/createStyleSetWithAdaptiveCards';
import defaultRenderMarkdown from './renderMarkdown';

// Add additional props to <WebChat>, so it support additional features
const FullReactWebChat = ({
  adaptiveCardHostConfig,
  adaptiveCardsHostConfig,
  adaptiveCardsPackage,
  attachmentMiddleware,
  renderMarkdown,
  styleOptions,
  styleSet,
  ...otherProps
}) => {
  useEffect(() => {
    adaptiveCardHostConfig &&
      console.warn(
        'Web Chat: "adaptiveCardHostConfig" is deprecated. Please use "adaptiveCardsHostConfig" instead. "adaptiveCardHostConfig" will be removed on or after 2022-01-01.'
      );
  }, [adaptiveCardHostConfig]);

  const patchedStyleSet = useMemo(() => styleSet || createStyleSet(styleOptions), [styleOptions, styleSet]);
  const { options: patchedStyleOptions } = patchedStyleSet;

  const patchedAdaptiveCardsHostConfig = useMemo(
    () => adaptiveCardsHostConfig || adaptiveCardHostConfig || createDefaultAdaptiveCardHostConfig(patchedStyleOptions),
    [adaptiveCardHostConfig, adaptiveCardsHostConfig, patchedStyleOptions]
  );

  const patchedAdaptiveCardsPackage = useMemo(() => adaptiveCardsPackage || defaultAdaptiveCardsPackage, [
    adaptiveCardsPackage
  ]);

  const patchedRenderMarkdown = useMemo(
    () => renderMarkdown || (markdown => defaultRenderMarkdown(markdown, patchedStyleOptions)),
    [renderMarkdown, patchedStyleOptions]
  );

  const patchedAttachmentMiddleware = useMemo(
    () => concatMiddleware(attachmentMiddleware, createAdaptiveCardsAttachmentMiddleware()),
    [attachmentMiddleware]
  );

  const adaptiveCardsContext = useMemo(
    () => ({
      adaptiveCardsPackage: patchedAdaptiveCardsPackage,
      hostConfig: patchedAdaptiveCardsHostConfig
    }),
    [patchedAdaptiveCardsHostConfig, patchedAdaptiveCardsPackage]
  );

  return (
    <AdaptiveCardsContext.Provider value={adaptiveCardsContext}>
      <BasicWebChat
        attachmentMiddleware={patchedAttachmentMiddleware}
        renderMarkdown={patchedRenderMarkdown}
        styleOptions={styleOptions}
        styleSet={patchedStyleSet}
        {...otherProps}
      />
    </AdaptiveCardsContext.Provider>
  );
};

FullReactWebChat.defaultProps = {
  adaptiveCardHostConfig: undefined,
  adaptiveCardsHostConfig: undefined,
  adaptiveCardsPackage: undefined,
  attachmentMiddleware: undefined,
  renderMarkdown: undefined,
  styleOptions: undefined,
  styleSet: undefined
};

FullReactWebChat.propTypes = {
  adaptiveCardHostConfig: PropTypes.any,
  adaptiveCardsHostConfig: PropTypes.any,
  adaptiveCardsPackage: PropTypes.any,
  attachmentMiddleware: PropTypes.func,
  renderMarkdown: PropTypes.func,
  styleOptions: PropTypes.any,
  styleSet: PropTypes.any
};

export default FullReactWebChat;
