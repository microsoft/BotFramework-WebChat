import createEmotion from '@emotion/css/create-instance';
import type {
  ComposerProps as APIComposerProps,
  SendBoxMiddleware,
  SendBoxToolbarMiddleware
} from 'botframework-webchat-api';
import {
  Composer as APIComposer,
  hooks,
  rectifySendBoxMiddlewareProps,
  rectifySendBoxToolbarMiddlewareProps,
  WebSpeechPonyfillFactory
} from 'botframework-webchat-api';
import { singleToArray } from 'botframework-webchat-core';
import classNames from 'classnames';
import MarkdownIt from 'markdown-it';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { Composer as SayComposer } from 'react-say';

import createDefaultAttachmentMiddleware from './Attachment/createMiddleware';
import Dictation from './Dictation';
import ErrorBox from './ErrorBox';
import {
  speechSynthesis as bypassSpeechSynthesis,
  SpeechSynthesisUtterance as BypassSpeechSynthesisUtterance
} from './hooks/internal/BypassSpeechSynthesisPonyfill';
import UITracker from './hooks/internal/UITracker';
import WebChatUIContext from './hooks/internal/WebChatUIContext';
import useStyleSet from './hooks/useStyleSet';
import createDefaultActivityMiddleware from './Middleware/Activity/createCoreMiddleware';
import createDefaultActivityStatusMiddleware from './Middleware/ActivityStatus/createCoreMiddleware';
import createDefaultAttachmentForScreenReaderMiddleware from './Middleware/AttachmentForScreenReader/createCoreMiddleware';
import createDefaultAvatarMiddleware from './Middleware/Avatar/createCoreMiddleware';
import createDefaultCardActionMiddleware from './Middleware/CardAction/createCoreMiddleware';
import createDefaultScrollToEndButtonMiddleware from './Middleware/ScrollToEndButton/createScrollToEndButtonMiddleware';
import createDefaultToastMiddleware from './Middleware/Toast/createCoreMiddleware';
import createDefaultTypingIndicatorMiddleware from './Middleware/TypingIndicator/createCoreMiddleware';
import ActivityTreeComposer from './providers/ActivityTree/ActivityTreeComposer';
import SendBoxComposer from './providers/internal/SendBox/SendBoxComposer';
import ModalDialogComposer from './providers/ModalDialog/ModalDialogComposer';
import useTheme from './providers/Theme/useTheme';
import createDefaultSendBoxMiddleware from './SendBox/createMiddleware';
import createDefaultSendBoxToolbarMiddleware from './SendBoxToolbar/createMiddleware';
import createStyleSet from './Styles/createStyleSet';
import { type ContextOf } from './types/ContextOf';
import { type FocusTranscriptInit } from './types/internal/FocusTranscriptInit';
import addTargetBlankToHyperlinksMarkdown from './Utils/addTargetBlankToHyperlinksMarkdown';
import createCSSKey from './Utils/createCSSKey';
import downscaleImageToDataURL from './Utils/downscaleImageToDataURL';
import mapMap from './Utils/mapMap';

const { useGetActivityByKey, useReferenceGrammarID, useStyleOptions } = hooks;

const node_env = process.env.node_env || process.env.NODE_ENV;

const emotionPool = {};

function styleSetToEmotionObjects(styleToEmotionObject, styleSet) {
  return mapMap(styleSet, (style, key) => (key === 'options' ? style : styleToEmotionObject(style)));
}

type ComposerCoreUIProps = Readonly<{ children?: ReactNode }>;

const ComposerCoreUI = memo(({ children }: ComposerCoreUIProps): ReactNode => {
  const [{ cssCustomProperties }] = useStyleSet();

  const dictationOnError = useCallback(err => {
    console.error(err);
  }, []);

  return (
    <div className={classNames('webchat__css-custom-properties', cssCustomProperties)}>
      <ModalDialogComposer>
        {/* When <SendBoxComposer> is finalized, it will be using an independent instance that lives inside <BasicSendBox>. */}
        <SendBoxComposer>
          {children}
          <Dictation onError={dictationOnError} />
        </SendBoxComposer>
      </ModalDialogComposer>
    </div>
  );
});

ComposerCoreUI.displayName = 'ComposerCoreUI';

type ComposerCoreProps = Readonly<
  PropsWithChildren<{
    extraStyleSet?: any;
    nonce?: string;
    renderMarkdown?: (
      markdown: string,
      newLineOptions: { markdownRespectCRLF: boolean },
      linkOptions: { externalLinkAlt: string }
    ) => string;
    styleSet?: any;
    suggestedActionsAccessKey?: boolean | string;
    webSpeechPonyfillFactory?: WebSpeechPonyfillFactory;
  }>
>;

const ComposerCore = ({
  children,
  extraStyleSet,
  nonce,
  renderMarkdown,
  styleSet,
  suggestedActionsAccessKey,
  webSpeechPonyfillFactory
}: ComposerCoreProps) => {
  const [dictateAbortable, setDictateAbortable] = useState();
  const [referenceGrammarID] = useReferenceGrammarID();
  const [styleOptions] = useStyleOptions();
  const focusTranscriptCallbacksRef = useRef<((init: FocusTranscriptInit) => Promise<void>)[]>([]);
  const internalMarkdownIt = useMemo(() => new MarkdownIt(), []);
  const scrollToCallbacksRef = useRef([]);
  const scrollToEndCallbacksRef = useRef([]);

  // Instead of having a `scrollUpCallbacksRef` and `scrollDownCallbacksRef`, they are combined into a single `scrollRelativeCallbacksRef`.
  // The first argument tells whether it should go "up" or "down".
  const scrollRelativeCallbacksRef = useRef([]);

  const internalRenderMarkdownInline = useMemo(
    () => markdown => {
      const tree = internalMarkdownIt.parseInline(markdown);

      // TODO: Use "betterLink" plugin.
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
      // Prefix "id-" to prevent object injection attack.
      emotionPool[`id-${nonce}`] ||
      (emotionPool[`id-${nonce}`] = createEmotion({ key: `webchat--css-${createCSSKey()}`, nonce }));

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

  const scrollPositionObserversRef = useRef([]);

  const dispatchScrollPosition = useCallback(
    event => scrollPositionObserversRef.current.forEach(observer => observer(event)),
    [scrollPositionObserversRef]
  );

  const observeScrollPosition = useCallback(
    observer => {
      scrollPositionObserversRef.current = [...scrollPositionObserversRef.current, observer];

      return () => {
        scrollPositionObserversRef.current = scrollPositionObserversRef.current.filter(target => target !== observer);
      };
    },
    [scrollPositionObserversRef]
  );

  const transcriptFocusObserversRef = useRef([]);
  const [numTranscriptFocusObservers, setNumTranscriptFocusObservers] = useState(0);

  const getActivityByKey = useGetActivityByKey();

  const dispatchTranscriptFocusByActivityKey = useMemo(() => {
    let prevActivityKey: string | Symbol | undefined = Symbol();

    return activityKey => {
      if (activityKey !== prevActivityKey) {
        prevActivityKey = activityKey;

        const event = { activity: getActivityByKey(activityKey) };

        transcriptFocusObserversRef.current.forEach(observer => observer(event));
      }
    };
  }, [getActivityByKey, transcriptFocusObserversRef]);

  const observeTranscriptFocus = useCallback(
    observer => {
      transcriptFocusObserversRef.current = [...transcriptFocusObserversRef.current, observer];
      setNumTranscriptFocusObservers(transcriptFocusObserversRef.current.length);

      return () => {
        transcriptFocusObserversRef.current = transcriptFocusObserversRef.current.filter(target => target !== observer);
        setNumTranscriptFocusObservers(transcriptFocusObserversRef.current.length);
      };
    },
    [transcriptFocusObserversRef, setNumTranscriptFocusObservers]
  );

  const context = useMemo<ContextOf<typeof WebChatUIContext>>(
    () => ({
      dictateAbortable,
      dispatchScrollPosition,
      dispatchTranscriptFocusByActivityKey,
      focusTranscriptCallbacksRef,
      internalMarkdownItState: [internalMarkdownIt],
      internalRenderMarkdownInline,
      nonce,
      numTranscriptFocusObservers,
      observeScrollPosition,
      observeTranscriptFocus,
      renderMarkdown,
      scrollRelativeCallbacksRef,
      scrollToCallbacksRef,
      scrollToEndCallbacksRef,
      setDictateAbortable,
      styleSet: patchedStyleSet,
      styleToEmotionObject,
      suggestedActionsAccessKey,
      webSpeechPonyfill
    }),
    [
      dictateAbortable,
      dispatchScrollPosition,
      dispatchTranscriptFocusByActivityKey,
      focusTranscriptCallbacksRef,
      internalMarkdownIt,
      internalRenderMarkdownInline,
      nonce,
      numTranscriptFocusObservers,
      observeScrollPosition,
      observeTranscriptFocus,
      patchedStyleSet,
      renderMarkdown,
      scrollRelativeCallbacksRef,
      scrollToCallbacksRef,
      scrollToEndCallbacksRef,
      setDictateAbortable,
      styleToEmotionObject,
      suggestedActionsAccessKey,
      webSpeechPonyfill
    ]
  );

  return (
    <SayComposer ponyfill={webSpeechPonyfill}>
      <WebChatUIContext.Provider value={context}>
        <ComposerCoreUI>{children}</ComposerCoreUI>
      </WebChatUIContext.Provider>
    </SayComposer>
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

type ComposerProps = APIComposerProps & ComposerCoreProps;

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
  scrollToEndButtonMiddleware,
  sendBoxMiddleware: sendBoxMiddlewareFromProps,
  sendBoxToolbarMiddleware: sendBoxToolbarMiddlewareFromProps,
  styleOptions,
  styleSet,
  suggestedActionsAccessKey,
  toastMiddleware,
  typingIndicatorMiddleware,
  webSpeechPonyfillFactory,
  ...composerProps
}: ComposerProps) => {
  const { nonce, onTelemetry } = composerProps;
  const theme = useTheme();

  const patchedActivityMiddleware = useMemo(
    () => [...singleToArray(activityMiddleware), ...theme.activityMiddleware, ...createDefaultActivityMiddleware()],
    [activityMiddleware, theme.activityMiddleware]
  );

  const patchedActivityStatusMiddleware = useMemo(
    () => [
      ...singleToArray(activityStatusMiddleware),
      ...theme.activityStatusMiddleware,
      ...createDefaultActivityStatusMiddleware()
    ],
    [activityStatusMiddleware, theme.activityStatusMiddleware]
  );

  const patchedAttachmentForScreenReaderMiddleware = useMemo(
    () => [
      ...singleToArray(attachmentForScreenReaderMiddleware),
      ...theme.attachmentForScreenReaderMiddleware,
      ...createDefaultAttachmentForScreenReaderMiddleware()
    ],
    [attachmentForScreenReaderMiddleware, theme.attachmentForScreenReaderMiddleware]
  );

  const patchedAttachmentMiddleware = useMemo(
    () => [
      ...singleToArray(attachmentMiddleware),
      ...theme.attachmentMiddleware,
      ...createDefaultAttachmentMiddleware()
    ],
    [attachmentMiddleware, theme.attachmentMiddleware]
  );

  const patchedAvatarMiddleware = useMemo(
    () => [...singleToArray(avatarMiddleware), ...theme.avatarMiddleware, ...createDefaultAvatarMiddleware()],
    [avatarMiddleware, theme.avatarMiddleware]
  );

  const patchedCardActionMiddleware = useMemo(
    () => [
      ...singleToArray(cardActionMiddleware),
      ...theme.cardActionMiddleware,
      ...createDefaultCardActionMiddleware()
    ],
    [cardActionMiddleware, theme.cardActionMiddleware]
  );

  const patchedToastMiddleware = useMemo(
    () => [...singleToArray(toastMiddleware), ...theme.toastMiddleware, ...createDefaultToastMiddleware()],
    [toastMiddleware, theme.toastMiddleware]
  );

  const patchedTypingIndicatorMiddleware = useMemo(
    () => [
      ...singleToArray(typingIndicatorMiddleware),
      ...theme.typingIndicatorMiddleware,
      ...createDefaultTypingIndicatorMiddleware()
    ],
    [typingIndicatorMiddleware, theme.typingIndicatorMiddleware]
  );

  const defaultScrollToEndButtonMiddleware = useMemo(() => createDefaultScrollToEndButtonMiddleware(), []);

  const patchedScrollToEndButtonMiddleware = useMemo(
    () => [
      ...singleToArray(scrollToEndButtonMiddleware),
      ...theme.scrollToEndButtonMiddleware,
      ...defaultScrollToEndButtonMiddleware
    ],
    [defaultScrollToEndButtonMiddleware, scrollToEndButtonMiddleware, theme.scrollToEndButtonMiddleware]
  );

  const patchedStyleOptions = useMemo(
    () => ({ ...theme.styleOptions, ...styleOptions }),
    [styleOptions, theme.styleOptions]
  );

  const sendBoxMiddleware = useMemo<readonly SendBoxMiddleware[]>(
    () =>
      Object.freeze([
        ...rectifySendBoxMiddlewareProps(sendBoxMiddlewareFromProps),
        ...rectifySendBoxMiddlewareProps(theme.sendBoxMiddleware),
        ...createDefaultSendBoxMiddleware()
      ]),
    [sendBoxMiddlewareFromProps, theme.sendBoxMiddleware]
  );

  const sendBoxToolbarMiddleware = useMemo<readonly SendBoxToolbarMiddleware[]>(
    () =>
      Object.freeze([
        ...rectifySendBoxToolbarMiddlewareProps(sendBoxToolbarMiddlewareFromProps),
        ...rectifySendBoxToolbarMiddlewareProps(theme.sendBoxToolbarMiddleware),
        ...createDefaultSendBoxToolbarMiddleware()
      ]),
    [sendBoxToolbarMiddlewareFromProps, theme.sendBoxToolbarMiddleware]
  );

  return (
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
      scrollToEndButtonMiddleware={patchedScrollToEndButtonMiddleware}
      sendBoxMiddleware={sendBoxMiddleware}
      sendBoxToolbarMiddleware={sendBoxToolbarMiddleware}
      styleOptions={patchedStyleOptions}
      toastMiddleware={patchedToastMiddleware}
      typingIndicatorMiddleware={patchedTypingIndicatorMiddleware}
      {...composerProps}
    >
      <ActivityTreeComposer>
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
      </ActivityTreeComposer>
    </APIComposer>
  );
};

Composer.defaultProps = {
  ...APIComposer.defaultProps,
  ...ComposerCore.defaultProps,
  children: undefined
};

Composer.propTypes = {
  ...APIComposer.propTypes,
  ...ComposerCore.propTypes,
  children: PropTypes.any
};

export default Composer;

export type { ComposerProps };
