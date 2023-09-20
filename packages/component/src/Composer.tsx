import { Composer as APIComposer, hooks, WebSpeechPonyfillFactory } from 'botframework-webchat-api';
import { Composer as SayComposer } from 'react-say';
import { singleToArray } from 'botframework-webchat-core';
import classNames from 'classnames';
import createEmotion from '@emotion/css/create-instance';
import createStyleSet from './Styles/createStyleSet';
import MarkdownIt from 'markdown-it';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';

import {
  speechSynthesis as bypassSpeechSynthesis,
  SpeechSynthesisUtterance as BypassSpeechSynthesisUtterance
} from './hooks/internal/BypassSpeechSynthesisPonyfill';
import ActivityTreeComposer from './providers/ActivityTree/ActivityTreeComposer';
import addTargetBlankToHyperlinksMarkdown from './Utils/addTargetBlankToHyperlinksMarkdown';
import createCSSKey from './Utils/createCSSKey';
import createDefaultActivityMiddleware from './Middleware/Activity/createCoreMiddleware';
import createDefaultActivityStatusMiddleware from './Middleware/ActivityStatus/createCoreMiddleware';
import createDefaultAttachmentForScreenReaderMiddleware from './Middleware/AttachmentForScreenReader/createCoreMiddleware';
import createDefaultAttachmentMiddleware from './Attachment/createMiddleware';
import createDefaultAvatarMiddleware from './Middleware/Avatar/createCoreMiddleware';
import createDefaultCardActionMiddleware from './Middleware/CardAction/createCoreMiddleware';
import createDefaultScrollToEndButtonMiddleware from './Middleware/ScrollToEndButton/createScrollToEndButtonMiddleware';
import createDefaultToastMiddleware from './Middleware/Toast/createCoreMiddleware';
import createDefaultTypingIndicatorMiddleware from './Middleware/TypingIndicator/createCoreMiddleware';
import Dictation from './Dictation';
import downscaleImageToDataURL from './Utils/downscaleImageToDataURL';
import ErrorBox from './ErrorBox';
import mapMap from './Utils/mapMap';
import ModalDialogComposer from './providers/ModalDialog/ModalDialogComposer';
import SendBoxComposer from './providers/internal/SendBox/SendBoxComposer';
import UITracker from './hooks/internal/UITracker';
import useStyleSet from './hooks/useStyleSet';
import WebChatUIContext from './hooks/internal/WebChatUIContext';

import type { ComposerProps as APIComposerProps } from 'botframework-webchat-api';
import type { FC, ReactNode } from 'react';

const { useGetActivityByKey, useReferenceGrammarID, useStyleOptions } = hooks;

const node_env = process.env.node_env || process.env.NODE_ENV;

const emotionPool = {};

function styleSetToEmotionObjects(styleToEmotionObject, styleSet) {
  return mapMap(styleSet, (style, key) => (key === 'options' ? style : styleToEmotionObject(style)));
}

type ComposerCoreUIProps = Readonly<{ children?: ReactNode }>;

const ComposerCoreUI = memo(({ children }: ComposerCoreUIProps) => {
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

type ComposerCoreProps = Readonly<{
  children?: ReactNode;
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
}>;

const ComposerCore: FC<ComposerCoreProps> = ({
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
  const focusSendBoxCallbacksRef = useRef([]);
  const focusTranscriptCallbacksRef = useRef([]);
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

  const context = useMemo(
    () => ({
      dictateAbortable,
      dispatchScrollPosition,
      dispatchTranscriptFocusByActivityKey,
      focusSendBoxCallbacksRef,
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
      focusSendBoxCallbacksRef,
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
  children: undefined,
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

const Composer: FC<ComposerProps> = ({
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

  const patchedToastMiddleware = useMemo(
    () => [...singleToArray(toastMiddleware), ...createDefaultToastMiddleware()],
    [toastMiddleware]
  );

  const patchedTypingIndicatorMiddleware = useMemo(
    () => [...singleToArray(typingIndicatorMiddleware), ...createDefaultTypingIndicatorMiddleware()],
    [typingIndicatorMiddleware]
  );

  const defaultScrollToEndButtonMiddleware = useMemo(() => createDefaultScrollToEndButtonMiddleware(), []);

  const patchedScrollToEndButtonMiddleware = useMemo(
    () => [...singleToArray(scrollToEndButtonMiddleware), ...defaultScrollToEndButtonMiddleware],
    [defaultScrollToEndButtonMiddleware, scrollToEndButtonMiddleware]
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
