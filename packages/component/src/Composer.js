import { Composer as SayComposer } from 'react-say';
import { Composer as ScrollToBottomComposer } from 'react-scroll-to-bottom';

import { css } from 'glamor';
import { Provider } from 'react-redux';
import MarkdownIt from 'markdown-it';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import updateIn from 'simple-update-in';

import createActivityRenderer from './Middleware/createActivityRenderer';
import createActivityStatusRenderer from './Middleware/createActivityStatusRenderer';
import createAttachmentRenderer from './Middleware/createAttachmentRenderer';
import createAvatarRenderer from './Middleware/createAvatarRenderer';
import createCustomEvent from './Utils/createCustomEvent';
import createToastRenderer from './Middleware/createToastRenderer';
import createTypingIndicatorRenderer from './Middleware/createTypingIndicatorRenderer';
import ErrorBoundary from './ErrorBoundary';
import getAllLocalizedStrings from './Localization/getAllLocalizedStrings';
import isObject from './Utils/isObject';
import normalizeLanguage from './Utils/normalizeLanguage';
import PrecompiledGlobalize from './Utils/PrecompiledGlobalize';
import useReferenceGrammarID from './hooks/useReferenceGrammarID';

import {
  clearSuggestedActions,
  connect as createConnectAction,
  createStore,
  disconnect,
  dismissNotification,
  emitTypingIndicator,
  markActivity,
  postActivity,
  sendEvent,
  sendFiles,
  sendMessage,
  sendMessageBack,
  sendPostBack,
  setDictateInterims,
  setDictateState,
  setLanguage,
  setNotification,
  setSendBox,
  setSendTimeout,
  setSendTypingIndicator,
  startDictate,
  startSpeakingActivity,
  stopDictate,
  stopSpeakingActivity,
  submitSendBox
} from 'botframework-webchat-core';

import addTargetBlankToHyperlinksMarkdown from './Utils/addTargetBlankToHyperlinksMarkdown';
import concatMiddleware from './Middleware/concatMiddleware';
import createCoreCardActionMiddleware from './Middleware/CardAction/createCoreMiddleware';
import createDefaultGroupActivitiesMiddleware from './Middleware/GroupActivities/createCoreMiddleware';
import createStyleSet from './Styles/createStyleSet';
import defaultSelectVoice from './defaultSelectVoice';
import Dictation from './Dictation';
import mapMap from './Utils/mapMap';
import observableToPromise from './Utils/observableToPromise';
import Tracker from './Tracker';
import WebChatReduxContext, { useDispatch } from './WebChatReduxContext';
import WebChatUIContext from './WebChatUIContext';

import {
  speechSynthesis as bypassSpeechSynthesis,
  SpeechSynthesisUtterance as BypassSpeechSynthesisUtterance
} from './Speech/BypassSpeechSynthesisPonyfill';

// List of Redux actions factory we are hoisting as Web Chat functions
const DISPATCHERS = {
  clearSuggestedActions,
  dismissNotification,
  emitTypingIndicator,
  markActivity,
  postActivity,
  sendEvent,
  sendFiles,
  sendMessage,
  sendMessageBack,
  sendPostBack,
  setDictateInterims,
  setDictateState,
  setNotification,
  setSendBox,
  setSendTimeout,
  startDictate,
  startSpeakingActivity,
  stopDictate,
  stopSpeakingActivity,
  submitSendBox
};

function styleSetToClassNames(styleSet) {
  return mapMap(styleSet, (style, key) => (key === 'options' ? style : css(style)));
}

function createCardActionContext({ cardActionMiddleware, directLine, dispatch }) {
  const runMiddleware = concatMiddleware(cardActionMiddleware, createCoreCardActionMiddleware())({ dispatch });

  return {
    onCardAction: (cardAction, { target } = {}) =>
      runMiddleware(({ cardAction: { type } }) => {
        throw new Error(`Web Chat: received unknown card action "${type}"`);
      })({
        cardAction,
        getSignInUrl:
          cardAction.type === 'signin'
            ? () => {
                const { value } = cardAction;

                if (directLine.getSessionId) {
                  // TODO: [P3] We should change this one to async/await.
                  //       This is the first place in this project to use async.
                  //       Thus, we need to add @babel/plugin-transform-runtime and @babel/runtime.

                  return observableToPromise(directLine.getSessionId()).then(
                    sessionId => `${value}${encodeURIComponent(`&code_challenge=${sessionId}`)}`
                  );
                }

                console.warn('botframework-webchat: OAuth is not supported on this Direct Line adapter.');

                return value;
              }
            : null,
        target
      })
  };
}

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

function createGroupActivitiesContext({ groupActivitiesMiddleware, groupTimestamp }) {
  const runMiddleware = concatMiddleware(
    groupActivitiesMiddleware,
    createDefaultGroupActivitiesMiddleware({ groupTimestamp })
  )()(() => {
    throw new Error('botframework-webchat internal: No middleware is execute for groupActivities.');
  });

  return {
    groupActivities: ({ activities }) => runMiddleware({ activities })
  };
}

function mergeStringsOverrides(localizedStrings, language, overrideLocalizedStrings) {
  if (!overrideLocalizedStrings) {
    return localizedStrings;
  } else if (typeof overrideLocalizedStrings === 'function') {
    const merged = overrideLocalizedStrings(localizedStrings, language);

    if (!isObject(merged)) {
      throw new Error('botframework-webchat: overrideLocalizedStrings function must return an object.');
    }

    return merged;
  }

  if (!isObject(overrideLocalizedStrings)) {
    throw new Error('botframework-webchat: overrideLocalizedStrings must be either a function, an object, or falsy.');
  }

  return { ...localizedStrings, ...overrideLocalizedStrings };
}

const Composer = ({
  activityMiddleware,
  activityRenderer,
  activityStatusMiddleware,
  activityStatusRenderer,
  attachmentMiddleware,
  attachmentRenderer,
  avatarMiddleware,
  avatarRenderer,
  cardActionMiddleware,
  children,
  dir,
  directLine,
  disabled,
  extraStyleSet,
  grammars,
  groupActivitiesMiddleware,
  groupTimestamp,
  locale,
  onTelemetry,
  overrideLocalizedStrings,
  renderMarkdown,
  selectVoice,
  sendTimeout,
  sendTypingIndicator,
  styleOptions,
  styleSet,
  suggestedActionsAccessKey,
  toastMiddleware,
  toastRenderer,
  typingIndicatorMiddleware,
  typingIndicatorRenderer,
  userID,
  username,
  webSpeechPonyfillFactory
}) => {
  const [dictateAbortable, setDictateAbortable] = useState();
  const [referenceGrammarID] = useReferenceGrammarID();
  const dispatch = useDispatch();
  const sendBoxFocusRef = useRef();
  const telemetryDimensionsRef = useRef({});
  const transcriptFocusRef = useRef();

  const patchedDir = useMemo(() => (dir === 'ltr' || dir === 'rtl' ? dir : 'auto'), [dir]);
  const patchedGrammars = useMemo(() => grammars || [], [grammars]);

  const patchedStyleOptions = useMemo(() => {
    const patchedStyleOptions = { ...styleOptions };

    if (typeof groupTimestamp !== 'undefined' && typeof patchedStyleOptions.groupTimestamp === 'undefined') {
      console.warn(
        'Web Chat: "groupTimestamp" has been moved to "styleOptions". This deprecation migration will be removed on or after January 1 2022.'
      );

      patchedStyleOptions.groupTimestamp = groupTimestamp;
    }

    if (typeof sendTimeout !== 'undefined' && typeof patchedStyleOptions.sendTimeout === 'undefined') {
      console.warn(
        'Web Chat: "sendTimeout" has been moved to "styleOptions". This deprecation migration will be removed on or after January 1 2022.'
      );

      patchedStyleOptions.sendTimeout = sendTimeout;
    }

    if (styleOptions.slowConnectionAfter < 0) {
      console.warn('Web Chat: "slowConnectionAfter" cannot be negative, will set to 0.');

      patchedStyleOptions.slowConnectionAfter = 0;
    }

    return patchedStyleOptions;
  }, [groupTimestamp, sendTimeout, styleOptions]);

  useEffect(() => {
    dispatch(setLanguage(locale));
  }, [dispatch, locale]);

  useEffect(() => {
    typeof sendTimeout === 'number' && dispatch(setSendTimeout(sendTimeout));
  }, [dispatch, sendTimeout]);

  useEffect(() => {
    dispatch(setSendTypingIndicator(!!sendTypingIndicator));
  }, [dispatch, sendTypingIndicator]);

  useEffect(() => {
    dispatch(
      createConnectAction({
        directLine,
        userID,
        username
      })
    );

    return () => {
      // TODO: [P3] disconnect() is an async call (pending -> fulfilled), we need to wait, or change it to reconnect()
      dispatch(disconnect());
    };
  }, [dispatch, directLine, userID, username]);

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

  const cardActionContext = useMemo(() => createCardActionContext({ cardActionMiddleware, directLine, dispatch }), [
    cardActionMiddleware,
    directLine,
    dispatch
  ]);

  const patchedSelectVoice = useCallback(selectVoice || defaultSelectVoice.bind(null, { language: locale }), [
    selectVoice
  ]);

  const focusContext = useMemo(() => createFocusContext({ sendBoxFocusRef, transcriptFocusRef }), [
    sendBoxFocusRef,
    transcriptFocusRef
  ]);

  const patchedStyleSet = useMemo(
    () => styleSetToClassNames({ ...(styleSet || createStyleSet(patchedStyleOptions)), ...extraStyleSet }),
    [extraStyleSet, patchedStyleOptions, styleSet]
  );

  const groupActivitiesContext = useMemo(
    () =>
      createGroupActivitiesContext({
        groupActivitiesMiddleware,
        groupTimestamp: patchedStyleSet.options.groupTimestamp
      }),
    [groupActivitiesMiddleware, patchedStyleSet.options.groupTimestamp]
  );

  const hoistedDispatchers = useMemo(
    () => mapMap(DISPATCHERS, dispatcher => (...args) => dispatch(dispatcher(...args))),
    [dispatch]
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

  const dictationOnError = useCallback(err => {
    console.error(err);
  }, []);

  const patchedLocalizedStrings = useMemo(
    () => mergeStringsOverrides(getAllLocalizedStrings()[normalizeLanguage(locale)], locale, overrideLocalizedStrings),
    [locale, overrideLocalizedStrings]
  );

  const localizedGlobalize = useMemo(() => {
    const { GLOBALIZE, GLOBALIZE_LANGUAGE } = patchedLocalizedStrings || {};

    return GLOBALIZE || (GLOBALIZE_LANGUAGE && PrecompiledGlobalize(GLOBALIZE_LANGUAGE)) || PrecompiledGlobalize('en');
  }, [patchedLocalizedStrings]);

  const trackDimension = useCallback(
    (name, data) => {
      if (!name || typeof name !== 'string') {
        return console.warn('botframework-webchat: Telemetry dimension name must be a string.');
      }

      const type = typeof data;

      if (type !== 'string' && type !== 'undefined') {
        return console.warn('botframework-webchat: Telemetry dimension data must be a string or undefined.');
      }

      telemetryDimensionsRef.current = updateIn(
        telemetryDimensionsRef.current,
        [name],
        type === 'undefined' ? data : () => data
      );
    },
    [telemetryDimensionsRef]
  );

  const patchedActivityRenderer = useMemo(() => {
    activityRenderer &&
      console.warn(
        'Web Chat: "activityRenderer" is deprecated and will be removed on 2020-06-15, please use "activityMiddleware" instead.'
      );

    return activityRenderer || createActivityRenderer(activityMiddleware);
  }, [activityMiddleware, activityRenderer]);

  const patchedActivityStatusRenderer = useMemo(() => {
    activityStatusRenderer &&
      console.warn(
        'Web Chat: "activityStatusRenderer" is deprecated and will be removed on 2020-06-15, please use "activityStatusMiddleware" instead.'
      );

    return activityStatusRenderer || createActivityStatusRenderer(activityStatusMiddleware);
  }, [activityStatusMiddleware, activityStatusRenderer]);

  const patchedAttachmentRenderer = useMemo(() => {
    attachmentRenderer &&
      console.warn(
        'Web Chat: "attachmentRenderer" is deprecated and will be removed on 2020-06-15, please use "attachmentMiddleware" instead.'
      );

    return attachmentRenderer || createAttachmentRenderer(attachmentMiddleware);
  }, [attachmentMiddleware, attachmentRenderer]);

  const patchedAvatarRenderer = useMemo(() => {
    avatarRenderer &&
      console.warn(
        'Web Chat: "avatarRenderer" is deprecated and will be removed on 2020-06-15, please use "avatarMiddleware" instead.'
      );

    return avatarRenderer || createAvatarRenderer(avatarMiddleware);
  }, [avatarMiddleware, avatarRenderer]);

  const patchedToastRenderer = useMemo(() => {
    toastRenderer &&
      console.warn(
        'Web Chat: "toastRenderer" is deprecated and will be removed on 2020-06-15, please use "toastMiddleware" instead.'
      );

    return toastRenderer || createToastRenderer(toastMiddleware);
  }, [toastMiddleware, toastRenderer]);

  const patchedTypingIndicatorRenderer = useMemo(() => {
    typingIndicatorRenderer &&
      console.warn(
        'Web Chat: "typingIndicatorRenderer" is deprecated and will be removed on 2020-06-15, please use "typingIndicatorMiddleware" instead.'
      );

    return typingIndicatorRenderer || createTypingIndicatorRenderer(typingIndicatorMiddleware);
  }, [typingIndicatorMiddleware, typingIndicatorRenderer]);

  const transcriptActivityElementsRef = useRef([]);
  const transcriptRootElementRef = useRef();

  // This is a heavy function, and it is expected to be only called when there is a need to recreate business logic, e.g.
  // - User ID changed, causing all send* functions to be updated
  // - send

  // TODO: [P3] We should think about if we allow the user to change onSendBoxValueChanged/sendBoxValue, e.g.
  // 1. Turns text into UPPERCASE
  // 2. Filter out profanity

  // TODO: [P4] Revisit all members of context
  //       This context should consist of members that are not in the Redux store
  //       i.e. members that are not interested in other types of UIs
  const context = useMemo(
    () => ({
      ...cardActionContext,
      ...focusContext,
      ...groupActivitiesContext,
      ...hoistedDispatchers,
      activityRenderer: patchedActivityRenderer,
      activityStatusRenderer: patchedActivityStatusRenderer,
      attachmentRenderer: patchedAttachmentRenderer,
      avatarRenderer: patchedAvatarRenderer,
      dictateAbortable,
      dir: patchedDir,
      directLine,
      disabled,
      grammars: patchedGrammars,
      internalMarkdownItState: [internalMarkdownIt],
      internalRenderMarkdownInline,
      language: locale,
      localizedGlobalizeState: [localizedGlobalize],
      localizedStrings: patchedLocalizedStrings,
      onTelemetry,
      renderMarkdown,
      selectVoice: patchedSelectVoice,
      sendBoxFocusRef,
      sendTypingIndicator,
      setDictateAbortable,
      styleOptions,
      styleSet: patchedStyleSet,
      suggestedActionsAccessKey,
      telemetryDimensionsRef,
      toastRenderer: patchedToastRenderer,
      trackDimension,
      transcriptActivityElementsRef,
      transcriptFocusRef,
      transcriptRootElementRef,
      typingIndicatorRenderer: patchedTypingIndicatorRenderer,
      userID,
      username,
      webSpeechPonyfill
    }),
    [
      cardActionContext,
      dictateAbortable,
      directLine,
      disabled,
      focusContext,
      groupActivitiesContext,
      hoistedDispatchers,
      internalMarkdownIt,
      internalRenderMarkdownInline,
      locale,
      localizedGlobalize,
      onTelemetry,
      patchedActivityRenderer,
      patchedActivityStatusRenderer,
      patchedAttachmentRenderer,
      patchedAvatarRenderer,
      patchedDir,
      patchedGrammars,
      patchedLocalizedStrings,
      patchedSelectVoice,
      patchedStyleSet,
      patchedToastRenderer,
      patchedTypingIndicatorRenderer,
      renderMarkdown,
      sendBoxFocusRef,
      sendTypingIndicator,
      setDictateAbortable,
      styleOptions,
      suggestedActionsAccessKey,
      telemetryDimensionsRef,
      trackDimension,
      transcriptActivityElementsRef,
      transcriptFocusRef,
      transcriptRootElementRef,
      userID,
      username,
      webSpeechPonyfill
    ]
  );

  return (
    <WebChatUIContext.Provider value={context}>
      <SayComposer ponyfill={webSpeechPonyfill}>
        {typeof children === 'function' ? children(context) : children}
      </SayComposer>
      <Dictation onError={dictationOnError} />
      {onTelemetry && <Tracker />}
    </WebChatUIContext.Provider>
  );
};

// We will create a Redux store if it was not passed in
const ComposeWithStore = ({ onTelemetry, store, ...props }) => {
  const handleError = useCallback(
    ({ error }) => {
      onTelemetry && onTelemetry(createCustomEvent('exception', { error, fatal: true }));
    },
    [onTelemetry]
  );

  const memoizedStore = useMemo(() => store || createStore(), [store]);

  return (
    <ErrorBoundary onError={handleError}>
      <Provider context={WebChatReduxContext} store={memoizedStore}>
        <ScrollToBottomComposer>
          <Composer onTelemetry={onTelemetry} {...props} />
        </ScrollToBottomComposer>
      </Provider>
    </ErrorBoundary>
  );
};

ComposeWithStore.defaultProps = {
  onTelemetry: undefined,
  store: undefined
};

ComposeWithStore.propTypes = {
  onTelemetry: PropTypes.func,
  store: PropTypes.any
};

export default ComposeWithStore;

// TODO: [P3] We should consider moving some data from Redux store to props
//       Although we use `connectToWebChat` to hide the details of accessor of Redux store,
//       we should clean up the responsibility between Context and Redux store
//       We should decide which data is needed for React but not in other environment such as CLI/VSCode

Composer.defaultProps = {
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
  dir: 'auto',
  disabled: false,
  extraStyleSet: undefined,
  grammars: [],
  groupActivitiesMiddleware: undefined,
  groupTimestamp: undefined,
  locale: window.navigator.language || 'en-US',
  onTelemetry: undefined,
  overrideLocalizedStrings: undefined,
  renderMarkdown: undefined,
  selectVoice: undefined,
  sendTimeout: undefined,
  sendTypingIndicator: false,
  styleOptions: {},
  styleSet: undefined,
  suggestedActionsAccessKey: 'A a Å å',
  toastMiddleware: undefined,
  toastRenderer: undefined,
  typingIndicatorMiddleware: undefined,
  typingIndicatorRenderer: undefined,
  userID: '',
  username: '',
  webSpeechPonyfillFactory: undefined
};

Composer.propTypes = {
  activityMiddleware: PropTypes.func,
  activityRenderer: PropTypes.func,
  activityStatusMiddleware: PropTypes.func,
  activityStatusRenderer: PropTypes.func,
  attachmentMiddleware: PropTypes.func,
  attachmentRenderer: PropTypes.func,
  avatarMiddleware: PropTypes.func,
  avatarRenderer: PropTypes.func,
  cardActionMiddleware: PropTypes.func,
  children: PropTypes.any,
  dir: PropTypes.oneOf(['auto', 'ltr', 'rtl']),
  directLine: PropTypes.shape({
    activity$: PropTypes.shape({
      subscribe: PropTypes.func.isRequired
    }).isRequired,
    connectionStatus$: PropTypes.shape({
      subscribe: PropTypes.func.isRequired
    }).isRequired,
    end: PropTypes.func,
    getSessionId: PropTypes.func,
    postActivity: PropTypes.func.isRequired,
    referenceGrammarID: PropTypes.string,
    token: PropTypes.string
  }).isRequired,
  disabled: PropTypes.bool,
  extraStyleSet: PropTypes.any,
  grammars: PropTypes.arrayOf(PropTypes.string),
  groupActivitiesMiddleware: PropTypes.func,
  groupTimestamp: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  locale: PropTypes.string,
  onTelemetry: PropTypes.func,
  overrideLocalizedStrings: PropTypes.oneOfType([PropTypes.any, PropTypes.func]),
  renderMarkdown: PropTypes.func,
  selectVoice: PropTypes.func,
  sendTimeout: PropTypes.number,
  sendTypingIndicator: PropTypes.bool,
  styleOptions: PropTypes.any,
  styleSet: PropTypes.any,
  suggestedActionsAccessKey: PropTypes.oneOfType([PropTypes.oneOf([false]), PropTypes.string]),
  toastMiddleware: PropTypes.func,
  toastRenderer: PropTypes.func,
  typingIndicatorMiddleware: PropTypes.func,
  typingIndicatorRenderer: PropTypes.func,
  userID: PropTypes.string,
  username: PropTypes.string,
  webSpeechPonyfillFactory: PropTypes.func
};
