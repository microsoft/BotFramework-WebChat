import { Composer as APIComposer, hooks } from 'botframework-webchat-api';
import { Composer as SayComposer } from 'react-say';
import { Composer as ScrollToBottomComposer } from 'react-scroll-to-bottom';
import createEmotion from 'create-emotion';
import createStyleSet from './Styles/createStyleSet';
import MarkdownIt from 'markdown-it';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import {
  speechSynthesis as bypassSpeechSynthesis,
  SpeechSynthesisUtterance as BypassSpeechSynthesisUtterance
} from './hooks/internal/BypassSpeechSynthesisPonyfill';
import addTargetBlankToHyperlinksMarkdown from './Utils/addTargetBlankToHyperlinksMarkdown';
import createCSSKey from './Utils/createCSSKey';
import createDefaultActivityMiddleware from './Middleware/Activity/createCoreMiddleware';
import createDefaultActivityStatusMiddleware from './Middleware/ActivityStatus/createCoreMiddleware';
import createDefaultAttachmentForScreenReaderMiddleware from './Middleware/AttachmentForScreenReader/createCoreMiddleware';
import createDefaultAttachmentMiddleware from './Middleware/Attachment/createCoreMiddleware';
import createDefaultAvatarMiddleware from './Middleware/Avatar/createCoreMiddleware';
import createDefaultCardActionMiddleware from './Middleware/CardAction/createCoreMiddleware';
import createDefaultToastMiddleware from './Middleware/Toast/createCoreMiddleware';
import createDefaultTypingIndicatorMiddleware from './Middleware/TypingIndicator/createCoreMiddleware';
import Dictation from './Dictation';
import downscaleImageToDataURL from './Utils/downscaleImageToDataURL';
import ErrorBox from './ErrorBox';
import mapMap from './Utils/mapMap';
import singleToArray from './Utils/singleToArray';
import UITracker from './hooks/internal/UITracker';
import WebChatUIContext from './hooks/internal/WebChatUIContext';

const { useReferenceGrammarID, useStyleOptions } = hooks;

const node_env = process.env.node_env || process.env.NODE_ENV;

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

const ComposerCore = ({
  children,
  extraStyleSet,
  nonce,
  renderMarkdown,
  styleSet,
  suggestedActionsAccessKey,
  webSpeechPonyfillFactory
}) => {
  const [dictateAbortable, setDictateAbortable] = useState();
  const [referenceGrammarID] = useReferenceGrammarID();
  const [styleOptions] = useStyleOptions();
  const internalMarkdownIt = useMemo(() => new MarkdownIt(), []);
  const sendBoxFocusRef = useRef();
  const transcriptActivityElementsRef = useRef([]);
  const transcriptFocusRef = useRef();
  const transcriptRootElementRef = useRef();

  const dictationOnError = useCallback(err => {
    console.error(err);
  }, []);

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

  const webSpeechPonyfill = useMemo(() => {
    const ponyfill = webSpeechPonyfillFactory && webSpeechPonyfillFactory({ referenceGrammarID });
    const { speechSynthesis, SpeechSynthesisUtterance } = ponyfill || {};

    return {
      ...ponyfill,
      speechSynthesis: speechSynthesis || bypassSpeechSynthesis,
      SpeechSynthesisUtterance: SpeechSynthesisUtterance || BypassSpeechSynthesisUtterance
    };
  }, [referenceGrammarID, webSpeechPonyfillFactory]);

  const context = useMemo(
    () => ({
      ...focusContext,
      dictateAbortable,
      internalMarkdownItState: [internalMarkdownIt],
      internalRenderMarkdownInline,
      nonce,
      renderMarkdown,
      sendBoxFocusRef,
      setDictateAbortable,
      styleSet: patchedStyleSet,
      styleToEmotionObject,
      suggestedActionsAccessKey,
      transcriptActivityElementsRef,
      transcriptFocusRef,
      transcriptRootElementRef,
      webSpeechPonyfill
    }),
    [
      dictateAbortable,
      focusContext,
      internalMarkdownIt,
      internalRenderMarkdownInline,
      nonce,
      patchedStyleSet,
      renderMarkdown,
      sendBoxFocusRef,
      setDictateAbortable,
      styleToEmotionObject,
      suggestedActionsAccessKey,
      transcriptActivityElementsRef,
      transcriptFocusRef,
      transcriptRootElementRef,
      webSpeechPonyfill
    ]
  );

  return (
    <React.Fragment>
      <SayComposer ponyfill={webSpeechPonyfill}>
        <WebChatUIContext.Provider value={context}>
          {children}
          <Dictation onError={dictationOnError} />
        </WebChatUIContext.Provider>
      </SayComposer>
    </React.Fragment>
  );
};

ComposerCore.defaultProps = {
  extraStyleSet: undefined,
  nonce: undefined,
  renderMarkdown: undefined,
  styleSet: undefined,
  suggestedActionsAccessKey: 'A a Å å',
  webSpeechPonyfillFactory: undefined
};

ComposerCore.propTypes = {
  extraStyleSet: PropTypes.any,
  nonce: PropTypes.string,
  renderMarkdown: PropTypes.func,
  styleSet: PropTypes.any,
  suggestedActionsAccessKey: PropTypes.oneOfType([PropTypes.oneOf([false]), PropTypes.string]),
  webSpeechPonyfillFactory: PropTypes.func
};

const Composer = ({
  activityMiddleware,
  activityStatusMiddleware,
  attachmentForScreenReaderMiddleware,
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
  webSpeechPonyfillFactory,
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

  const patchedAttachmentForScreenReaderMiddleware = useMemo(
    () => [
      ...singleToArray(attachmentForScreenReaderMiddleware),
      ...createDefaultAttachmentForScreenReaderMiddleware()
    ],
    [attachmentForScreenReaderMiddleware]
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
    <React.Fragment>
      <APIComposer
        activityMiddleware={patchedActivityMiddleware}
        activityStatusMiddleware={patchedActivityStatusMiddleware}
        attachmentForScreenReaderMiddleware={patchedAttachmentForScreenReaderMiddleware}
        attachmentMiddleware={patchedAttachmentMiddleware}
        avatarMiddleware={patchedAvatarMiddleware}
        cardActionMiddleware={patchedCardActionMiddleware}
        downscaleImageToDataURL={downscaleImageToDataURL}
        // Under dev server of create-react-app, "NODE_ENV" will be set to "development".
        internalErrorBoxClass={node_env === 'development' ? ErrorBox : undefined}
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
            webSpeechPonyfillFactory={webSpeechPonyfillFactory}
          >
            {children}
            {onTelemetry && <UITracker />}
          </ComposerCore>
        </ScrollToBottomComposer>
      </APIComposer>
    </React.Fragment>
  );
};

Composer.defaultProps = {
  ...APIComposer.defaultProps,
  ...ComposerCore.defaultProps,
  activityMiddleware: undefined,
  activityRenderer: undefined,
  activityStatusMiddleware: undefined,
  activityStatusRenderer: undefined,
  attachmentForScreenReaderMiddleware: undefined,
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
  typingIndicatorRenderer: undefined,
  webSpeechPonyfillFactory: undefined
};

Composer.propTypes = {
  ...APIComposer.propTypes,
  ...ComposerCore.propTypes,
  activityMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  activityRenderer: PropTypes.func,
  activityStatusMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  activityStatusRenderer: PropTypes.func,
  attachmentForScreenReaderMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
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
  typingIndicatorRenderer: PropTypes.func,
  webSpeechPonyfillFactory: PropTypes.func
};

export default Composer;
