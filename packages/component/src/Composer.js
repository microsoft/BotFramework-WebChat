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
import createDefaultAvatarMiddleware from './Middleware/Avatar/createCoreMiddleware';
import createDefaultCardActionMiddleware from './Middleware/CardAction/createCoreMiddleware';
import createDefaultToastMiddleware from './Middleware/Toast/createCoreMiddleware';
import createDefaultTypingIndicatorMiddleware from './Middleware/TypingIndicator/createCoreMiddleware';
import downscaleImageToDataURL from './Utils/downscaleImageToDataURL';
import ErrorBox from './ErrorBox';
import mapMap from './Utils/mapMap';
import singleToArray from './Utils/singleToArray';
import UITracker from './hooks/internal/UITracker';
import WebChatUIContext from './hooks/internal/WebChatUIContext';

const { useStyleOptions } = hooks;

const emotionPool = {};

function createFocusContext({ sendBoxFocusRef, transcriptFocusRef }) {
  return {
    focus: where => {
      const ref = where === 'sendBox' || where === 'sendBoxWithoutKeyboard' ? sendBoxFocusRef : transcriptFocusRef;
      const { current } = ref || {};

      if (current) {
        if (where === 'sendBoxWithoutKeyboard') {
          // To not activate the virtual keyboard while changing focus to an input, we will temporarily set it as read-only and flip it back.
          // https://stackoverflow.com/questions/7610758/prevent-iphone-default-keyboard-when-focusing-an-input/7610923
          const readOnly = current.getAttribute('readonly');

          current.setAttribute('readonly', 'readonly');

          setTimeout(() => {
            current.focus();
            readOnly ? current.setAttribute('readonly', readOnly) : current.removeAttribute('readonly');
          }, 0);
        } else {
          current.focus();
        }
      }
    }
  };
}

function styleSetToEmotionObjects(styleToEmotionObject, styleSet) {
  return mapMap(styleSet, (style, key) => (key === 'options' ? style : styleToEmotionObject(style)));
}

const ComposerCore = ({ children, extraStyleSet, nonce, renderMarkdown, styleSet, suggestedActionsAccessKey }) => {
  const [styleOptions] = useStyleOptions();
  const internalMarkdownIt = useMemo(() => new MarkdownIt(), []);
  const sendBoxFocusRef = useRef();
  const transcriptFocusRef = useRef();

  const focusContext = useMemo(() => createFocusContext({ sendBoxFocusRef, transcriptFocusRef }), [
    sendBoxFocusRef,
    transcriptFocusRef
  ]);

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
      ...focusContext,
      internalMarkdownItState: [internalMarkdownIt],
      internalRenderMarkdownInline,
      nonce,
      renderMarkdown,
      sendBoxFocusRef,
      styleSet: patchedStyleSet,
      styleToEmotionObject,
      suggestedActionsAccessKey,
      transcriptActivityElementsRef,
      transcriptFocusRef,
      transcriptRootElementRef
    }),
    [
      focusContext,
      internalMarkdownIt,
      internalRenderMarkdownInline,
      nonce,
      patchedStyleSet,
      renderMarkdown,
      sendBoxFocusRef,
      styleToEmotionObject,
      suggestedActionsAccessKey,
      transcriptActivityElementsRef,
      transcriptFocusRef,
      transcriptRootElementRef
    ]
  );

  return <WebChatUIContext.Provider value={context}>{children}</WebChatUIContext.Provider>;
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
  avatarMiddleware,
  cardActionMiddleware,
  children,
  extraStyleSet,
  renderMarkdown,
  styleSet,
  suggestedActionsAccessKey,
  toastMiddleware,
  typingIndicatorMiddleware,
  ...composerProps
}) => {
  const { nonce, onTelemetry } = composerProps;

  const patchedActivityMiddleware = useMemo(
    () => [...singleToArray(activityMiddleware), ...createDefaultActivityMiddleware()],
    [activityMiddleware]
  );

  const patchedActivityStatusMiddleware = useMemo(
    () => [...singleToArray(activityStatusMiddleware), ...createDefaultActivityStatusMiddleware()],
    [activityStatusMiddleware]
  );

  const patchedAttachmentMiddleware = useMemo(
    () => [...singleToArray(attachmentMiddleware), ...createDefaultAttachmentMiddleware()],
    [attachmentMiddleware]
  );

  const patchedAvatarMiddleware = useMemo(
    () => [...singleToArray(avatarMiddleware), ...createDefaultAvatarMiddleware()],
    [avatarMiddleware]
  );

  const patchedCardActionMiddleware = useMemo(
    () => [...singleToArray(cardActionMiddleware), ...createDefaultCardActionMiddleware()],
    [cardActionMiddleware]
  );

  const patchedToastMiddleware = useMemo(() => [...singleToArray(toastMiddleware), ...createDefaultToastMiddleware()], [
    toastMiddleware
  ]);

  const patchedTypingIndicatorMiddleware = useMemo(
    () => [...singleToArray(typingIndicatorMiddleware), ...createDefaultTypingIndicatorMiddleware()],
    [typingIndicatorMiddleware]
  );

  return (
    <APIComposer
      activityMiddleware={patchedActivityMiddleware}
      activityStatusMiddleware={patchedActivityStatusMiddleware}
      attachmentMiddleware={patchedAttachmentMiddleware}
      avatarMiddleware={patchedAvatarMiddleware}
      cardActionMiddleware={patchedCardActionMiddleware}
      downscaleImageToDataURL={downscaleImageToDataURL}
      internalErrorBoxClass={ErrorBox}
      nonce={nonce}
      toastMiddleware={patchedToastMiddleware}
      typingIndicatorMiddleware={patchedTypingIndicatorMiddleware}
      {...composerProps}
    >
      <ScrollToBottomComposer nonce={nonce}>
        <ComposerCore
          extraStyleSet={extraStyleSet}
          nonce={nonce}
          renderMarkdown={renderMarkdown}
          styleSet={styleSet}
          suggestedActionsAccessKey={suggestedActionsAccessKey}
        >
          {children}
        </ComposerCore>
      </ScrollToBottomComposer>
      {onTelemetry && <UITracker />}
    </APIComposer>
  );
};

Composer.defaultProps = {
  ...APIComposer.defaultProps,
  ...ComposerCore.defaultProps,
  activityMiddleware: undefined,
  activityRenderer: undefined,
  activityStatusMiddleware: undefined,
  activityStatusRenderer: undefined,
  attachmentMiddleware: undefined,
  attachmentRenderer: undefined,
  avatarMiddleware: undefined,
  avatarRenderer: undefined,
  cardActionMiddleware: undefined,
  children: undefined,
  nonce: undefined,
  renderMarkdown: undefined,
  toastMiddleware: undefined,
  toastRenderer: undefined,
  typingIndicatorMiddleware: undefined,
  typingIndicatorRenderer: undefined
};

Composer.propTypes = {
  ...APIComposer.propTypes,
  ...ComposerCore.propTypes,
  activityMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  activityRenderer: PropTypes.func,
  activityStatusMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  activityStatusRenderer: PropTypes.func,
  attachmentMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  attachmentRenderer: PropTypes.func,
  avatarMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  avatarRenderer: PropTypes.func,
  cardActionMiddleware: PropTypes.func,
  children: PropTypes.any,
  nonce: PropTypes.string,
  renderMarkdown: PropTypes.func,
  toastMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  toastRenderer: PropTypes.func,
  typingIndicatorMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  typingIndicatorRenderer: PropTypes.func
};

export default Composer;
