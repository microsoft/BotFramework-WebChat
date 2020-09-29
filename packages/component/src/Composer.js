import { Composer as APIComposer, hooks } from 'botframework-webchat-api';
import { Composer as ScrollToBottomComposer } from 'react-scroll-to-bottom';
import React, { useMemo, useRef } from 'react';
import createEmotion from 'create-emotion';
import createStyleSet from './Styles/createStyleSet';
import MarkdownIt from 'markdown-it';
import PropTypes from 'prop-types';

import addTargetBlankToHyperlinksMarkdown from './Utils/addTargetBlankToHyperlinksMarkdown';
import createCSSKey from './Utils/createCSSKey';
import createDefaultActivityMiddleware from './Middleware/Activity/createCoreMiddleware';
import createDefaultActivityStatusMiddleware from './Middleware/ActivityStatus/createCoreMiddleware';
import createDefaultAttachmentMiddleware from './Middleware/Attachment/createCoreMiddleware';
import ErrorBox from './ErrorBox';
import mapMap from './Utils/mapMap';
import singleToArray from './Utils/singleToArray';
import upgradeLegacyRendererMiddleware from './Utils/upgradeLegacyRendererMiddleware';
import WebChatUIContext from './hooks/internal/WebChatUIContext';

const { useStyleOptions } = hooks;

const emotionPool = {};

function styleSetToEmotionObjects(styleToEmotionObject, styleSet) {
  return mapMap(styleSet, (style, key) => (key === 'options' ? style : styleToEmotionObject(style)));
}

const ComposerCore = ({ children, extraStyleSet, nonce, renderMarkdown, styleSet, suggestedActionsAccessKey }) => {
  const [styleOptions] = useStyleOptions();
  const internalMarkdownIt = useMemo(() => new MarkdownIt(), []);

  const internalRenderMarkdownInline = useMemo(
    () => markdown => {
      const tree = internalMarkdownIt.parseInline(markdown);

      // We should add rel="noopener noreferrer" and target="_blank"
      const patchedTree = addTargetBlankToHyperlinksMarkdown(tree);

      return internalMarkdownIt.renderer.render(patchedTree);
    },
    [internalMarkdownIt]
  );

  const styleToEmotionObject = useMemo(() => {
    // Emotion doesn't hash with nonce. We need to provide the pooling mechanism.
    // 1. If 2 instances use different nonce, they should result in different hash;
    // 2. If 2 instances are being mounted, pooling will make sure we render only 1 set of <style> tags, instead of 2.
    const emotion =
      emotionPool[nonce] || (emotionPool[nonce] = createEmotion({ key: `webchat--css-${createCSSKey()}`, nonce }));

    return style => emotion.css(style);
  }, [nonce]);

  const patchedStyleSet = useMemo(
    () =>
      styleSetToEmotionObjects(styleToEmotionObject, {
        ...(styleSet || createStyleSet(styleOptions)),
        ...extraStyleSet
      }),
    [extraStyleSet, styleOptions, styleSet, styleToEmotionObject]
  );

  const transcriptActivityElementsRef = useRef([]);
  const transcriptRootElementRef = useRef();

  const context = useMemo(
    () => ({
      internalMarkdownItState: [internalMarkdownIt],
      internalRenderMarkdownInline,
      nonce,
      styleSet: patchedStyleSet,
      styleToEmotionObject,
      suggestedActionsAccessKey,
      transcriptActivityElementsRef,
      transcriptRootElementRef
    }),
    [
      internalMarkdownIt,
      internalRenderMarkdownInline,
      nonce,
      patchedStyleSet,
      styleToEmotionObject,
      suggestedActionsAccessKey,
      transcriptActivityElementsRef,
      transcriptRootElementRef
    ]
  );

  return (
    <WebChatUIContext.Provider value={context}>
      <ScrollToBottomComposer nonce={nonce}>{children}</ScrollToBottomComposer>
    </WebChatUIContext.Provider>
  );
};

ComposerCore.defaultProps = {
  extraStyleSet: undefined,
  nonce: undefined,
  renderMarkdown: undefined,
  styleSet: undefined,
  suggestedActionsAccessKey: 'A a Å å'
};

ComposerCore.propTypes = {
  extraStyleSet: PropTypes.any,
  nonce: PropTypes.string,
  renderMarkdown: PropTypes.func,
  styleSet: PropTypes.any,
  suggestedActionsAccessKey: PropTypes.oneOfType([PropTypes.oneOf([false]), PropTypes.string])
};

const Composer = ({
  activityMiddleware,
  activityStatusMiddleware,
  attachmentMiddleware,
  children,
  errorBoundaryMiddleware,
  ...props
}) => {
  const patchedActivityMiddleware = useMemo(
    () => [...singleToArray(activityMiddleware), ...createDefaultActivityMiddleware()].filter(middleware => middleware),
    [activityMiddleware]
  );

  const patchedActivityStatusMiddleware = useMemo(
    () =>
      [...singleToArray(activityStatusMiddleware), ...createDefaultActivityStatusMiddleware()].filter(
        middleware => middleware
      ),
    [activityStatusMiddleware]
  );

  const patchedAttachmentMiddleware = useMemo(
    () =>
      [...singleToArray(attachmentMiddleware), ...createDefaultAttachmentMiddleware()].filter(middleware => middleware),
    [attachmentMiddleware]
  );

  return (
    <APIComposer
      activityMiddleware={patchedActivityMiddleware}
      activityStatusMiddleware={patchedActivityStatusMiddleware}
      attachmentMiddleware={patchedAttachmentMiddleware}
      internalErrorBoxClass={ErrorBox}
      {...props}
    >
      <ComposerCore {...props}>{children}</ComposerCore>
    </APIComposer>
  );
};

Composer.defaultProps = {
  ...APIComposer.defaultProps,
  ...ComposerCore.defaultProps,
  activityMiddleware: undefined,
  activityStatusMiddleware: undefined,
  attachmentMiddleware: undefined
};

Composer.propTypes = {
  ...APIComposer.propTypes,
  ...ComposerCore.propTypes,
  activityMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  activityStatusMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  attachmentMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func])
};

export default Composer;
