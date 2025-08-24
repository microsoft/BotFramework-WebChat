import type {
  ComposerProps as APIComposerProps,
  SendBoxMiddleware,
  SendBoxToolbarMiddleware
} from 'botframework-webchat-api';
import {
  Composer as APIComposer,
  extractSendBoxMiddleware,
  extractSendBoxToolbarMiddleware,
  hooks,
  WebSpeechPonyfillFactory
} from 'botframework-webchat-api';
import { DecoratorComposer, type DecoratorMiddleware } from 'botframework-webchat-api/decorator';
import { singleToArray } from 'botframework-webchat-core';
import classNames from 'classnames';
import MarkdownIt from 'markdown-it';
import PropTypes from 'prop-types';
import React, {
  forwardRef,
  Fragment,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { Composer as SayComposer } from 'react-say';

import createDefaultAttachmentMiddleware from './Attachment/createMiddleware';
import BuiltInDecorator from './BuiltInDecorator';
import Dictation from './Dictation';
import ErrorBox from './ErrorBox';
import {
  speechSynthesis as bypassSpeechSynthesis,
  SpeechSynthesisUtterance as BypassSpeechSynthesisUtterance
} from './hooks/internal/BypassSpeechSynthesisPonyfill';
import { StyleToEmotionObjectComposer, useStyleToEmotionObject } from './hooks/internal/styleToEmotionObject';
import UITracker from './hooks/internal/UITracker';
import useInjectStyles from './hooks/internal/useInjectStyles';
import WebChatUIContext from './hooks/internal/WebChatUIContext';
import { FocusSendBoxScope } from './hooks/sendBoxFocus';
import { ScrollRelativeTranscriptScope } from './hooks/transcriptScrollRelative';
import useFocus from './hooks/useFocus';
import createDefaultActivityMiddleware from './Middleware/Activity/createCoreMiddleware';
import createDefaultActivityStatusMiddleware from './Middleware/ActivityStatus/createCoreMiddleware';
import createDefaultAttachmentForScreenReaderMiddleware from './Middleware/AttachmentForScreenReader/createCoreMiddleware';
import createDefaultAvatarMiddleware from './Middleware/Avatar/createCoreMiddleware';
import createDefaultCardActionMiddleware from './Middleware/CardAction/createCoreMiddleware';
import createDefaultScrollToEndButtonMiddleware from './Middleware/ScrollToEndButton/createScrollToEndButtonMiddleware';
import createDefaultToastMiddleware from './Middleware/Toast/createCoreMiddleware';
import createDefaultTypingIndicatorMiddleware from './Middleware/TypingIndicator/createCoreMiddleware';
import CustomElementsComposer from './providers/CustomElements/CustomElementsComposer';
import HTMLContentTransformComposer from './providers/HTMLContentTransformCOR/HTMLContentTransformComposer';
import { type HTMLContentTransformMiddleware } from './providers/HTMLContentTransformCOR/private/HTMLContentTransformContext';
import SendBoxComposer from './providers/internal/SendBox/SendBoxComposer';
import { LiveRegionTwinComposer } from './providers/LiveRegionTwin';
import ModalDialogComposer from './providers/ModalDialog/ModalDialogComposer';
import ReducedMotionComposer from './providers/ReducedMotion/ReducedMotionComposer';
import useTheme from './providers/Theme/useTheme';
import createDefaultSendBoxMiddleware from './SendBox/createMiddleware';
import createDefaultSendBoxToolbarMiddleware from './SendBoxToolbar/createMiddleware';
import createStyleSet from './Styles/createStyleSet';
import useCustomPropertiesClassName from './Styles/useCustomPropertiesClassName';
import WebChatTheme from './Styles/WebChatTheme';
import { type FocusTranscriptInit } from './types/internal/FocusTranscriptInit';
import addTargetBlankToHyperlinksMarkdown from './Utils/addTargetBlankToHyperlinksMarkdown';
import downscaleImageToDataURL from './Utils/downscaleImageToDataURL';
import mapMap from './Utils/mapMap';

export type ComposerRef = {
  focusSendBoxInput: () => Promise<void>;
};

const { useGetActivityByKey, useReferenceGrammarID, useStyleOptions, useTrackException } = hooks;

const ComposerWithRef = forwardRef<ComposerRef, { readonly children: ReactNode }>(({ children }, ref) => {
  const focus = useFocus();

  useImperativeHandle(
    ref,
    () => ({
      focusSendBoxInput: async () => {
        await focus('sendBox');
      }
    }),
    [focus]
  );

  return <Fragment>{children}</Fragment>;
});

const node_env = process.env.node_env || process.env.NODE_ENV;

function styleSetToEmotionObjects(styleToEmotionObject, styleSet) {
  return mapMap(styleSet, (style, key) => (key === 'options' ? style : styleToEmotionObject(style)));
}

type ComposerCoreUIProps = Readonly<{
  children: ReactNode;
}>;

const ROOT_STYLE = {
  '&.webchat__css-custom-properties': {
    '& .webchat__live-region': {
      color: 'transparent',
      height: 1,
      overflow: 'hidden',
      position: 'absolute',
      top: 0,
      whiteSpace: 'nowrap',
      width: 1
    }
  }
};

const ComposerCoreUI = memo(({ children }: ComposerCoreUIProps) => {
  const [{ internalLiveRegionFadeAfter }] = useStyleOptions();
  const [customPropertiesClassName] = useCustomPropertiesClassName();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const trackException = useTrackException();

  const dictationOnError = useCallback(
    (errorEvent: Event & { error: string }) => {
      // Ignore aborted error as it is likely user clicking on the microphone button to abort recognition.
      if (errorEvent.error !== 'aborted') {
        const nativeError = new Error('Speech recognition failed');

        nativeError.cause = errorEvent;

        trackException(nativeError, false);
        console.error(nativeError);
      }
    },
    [trackException]
  );

  return (
    <div className={classNames('webchat', 'webchat__css-custom-properties', rootClassName, customPropertiesClassName)}>
      <CustomElementsComposer>
        <FocusSendBoxScope>
          <ScrollRelativeTranscriptScope>
            <LiveRegionTwinComposer className="webchat__live-region" fadeAfter={internalLiveRegionFadeAfter}>
              <ModalDialogComposer>
                {/* When <SendBoxComposer> is finalized, it will be using an independent instance that lives inside <BasicSendBox>. */}
                <SendBoxComposer>
                  {children}
                  <Dictation onError={dictationOnError} />
                </SendBoxComposer>
              </ModalDialogComposer>
            </LiveRegionTwinComposer>
          </ScrollRelativeTranscriptScope>
        </FocusSendBoxScope>
      </CustomElementsComposer>
    </div>
  );
});

ComposerCoreUI.displayName = 'ComposerCoreUI';

type ComposerCoreProps = Readonly<{
  children?: ReactNode;
  extraStyleSet?: any;
  nonce?: string;
  renderMarkdown?: any;
  styles?: readonly (HTMLLinkElement | HTMLStyleElement)[];
  styleSet?: any;
  suggestedActionsAccessKey?: string | false;
  webSpeechPonyfillFactory?: WebSpeechPonyfillFactory;
}>;

type ComposerAdditionalProps = Readonly<{
  decoratorMiddleware?: any;
  htmlContentTransformMiddleware?: any;
}>;

const ComposerCore = ({
  children,
  extraStyleSet,
  nonce,
  renderMarkdown,
  styles,
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

  const styleToEmotionObject = useStyleToEmotionObject();

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
    let prevActivityKey: string | symbol | undefined = Symbol();

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

  useInjectStyles(styles, nonce);

  const context = useMemo(
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
      scrollToCallbacksRef,
      scrollToEndCallbacksRef,
      setDictateAbortable,
      styleSet: patchedStyleSet,
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
      scrollToCallbacksRef,
      scrollToEndCallbacksRef,
      setDictateAbortable,
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
  webSpeechPonyfillFactory: PropTypes.func,
  decoratorMiddleware: PropTypes.any,
  htmlContentTransformMiddleware: PropTypes.any
};

type ComposerProps = APIComposerProps & ComposerCoreProps & ComposerAdditionalProps;

const InternalComposer = forwardRef<ComposerRef, ComposerProps>(
  (
    {
      activityMiddleware,
      activityStatusMiddleware,
      attachmentForScreenReaderMiddleware,
      attachmentMiddleware,
      avatarMiddleware,
      cardActionMiddleware,
      children,
      decoratorMiddleware,
      extraStyleSet,
      htmlContentTransformMiddleware,
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
    },
    ref
  ) => {
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
          ...extractSendBoxMiddleware(sendBoxMiddlewareFromProps),
          ...extractSendBoxMiddleware(theme.sendBoxMiddleware),
          ...createDefaultSendBoxMiddleware()
        ]),
      [sendBoxMiddlewareFromProps, theme.sendBoxMiddleware]
    );

    const sendBoxToolbarMiddleware = useMemo<readonly SendBoxToolbarMiddleware[]>(
      () =>
        Object.freeze([
          ...extractSendBoxToolbarMiddleware(sendBoxToolbarMiddlewareFromProps),
          ...extractSendBoxToolbarMiddleware(theme.sendBoxToolbarMiddleware),
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
        {...(node_env === 'development' ? { internalErrorBoxClass: ErrorBox } : {})}
        nonce={nonce}
        scrollToEndButtonMiddleware={patchedScrollToEndButtonMiddleware}
        sendBoxMiddleware={sendBoxMiddleware}
        sendBoxToolbarMiddleware={sendBoxToolbarMiddleware}
        styleOptions={patchedStyleOptions}
        toastMiddleware={patchedToastMiddleware}
        typingIndicatorMiddleware={patchedTypingIndicatorMiddleware}
        {...composerProps}
      >
        <StyleToEmotionObjectComposer nonce={nonce}>
          <HTMLContentTransformComposer middleware={htmlContentTransformMiddleware}>
            <ReducedMotionComposer>
              <BuiltInDecorator>
                <DecoratorComposer middleware={decoratorMiddleware}>
                  <ComposerCore
                    extraStyleSet={extraStyleSet}
                    nonce={nonce}
                    renderMarkdown={renderMarkdown}
                    styleSet={styleSet}
                    styles={theme.styles}
                    suggestedActionsAccessKey={suggestedActionsAccessKey}
                    webSpeechPonyfillFactory={webSpeechPonyfillFactory}
                  >
                    <ComposerWithRef ref={ref}>
                      {children}
                      {onTelemetry && <UITracker />}
                    </ComposerWithRef>
                  </ComposerCore>
                </DecoratorComposer>
              </BuiltInDecorator>
            </ReducedMotionComposer>
          </HTMLContentTransformComposer>
        </StyleToEmotionObjectComposer>
      </APIComposer>
    );
  }
);

const Composer = forwardRef<ComposerRef, ComposerProps>((props, ref) => (
  <WebChatTheme>
    <InternalComposer ref={ref} {...props} />
  </WebChatTheme>
));

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
