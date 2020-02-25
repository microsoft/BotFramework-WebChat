import { Composer as SayComposer } from 'react-say';
import {
  Composer as ScrollToBottomComposer,
  FunctionContext as ScrollToBottomFunctionContext
} from 'react-scroll-to-bottom';

import { css } from 'glamor';
import { Provider } from 'react-redux';
import MarkdownIt from 'markdown-it';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import updateIn from 'simple-update-in';

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
    onCardAction: cardAction =>
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
            : null
      })
  };
}

function createFocusSendBoxContext({ sendBoxRef }) {
  return {
    focusSendBox: () => {
      const { current } = sendBoxRef || {};

      current && current.focus();
    }
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
  activityRenderer,
  activityStatusRenderer,
  attachmentRenderer,
  cardActionMiddleware,
  children,
  dir,
  directLine,
  disabled,
  extraStyleSet,
  grammars,
  groupTimestamp,
  locale,
  onTelemetry,
  overrideLocalizedStrings,
  renderMarkdown,
  scrollToEnd,
  selectVoice,
  sendBoxRef,
  sendTimeout,
  sendTypingIndicator,
  styleOptions,
  styleSet,
  toastRenderer,
  typingIndicatorRenderer,
  userID,
  username,
  webSpeechPonyfillFactory
}) => {
  const dispatch = useDispatch();
  const telemetryDimensionsRef = useRef({});
  const [referenceGrammarID] = useReferenceGrammarID();
  const [dictateAbortable, setDictateAbortable] = useState();

  const patchedDir = useMemo(() => (dir === 'ltr' || dir === 'rtl' ? dir : 'auto'), [dir]);
  const patchedLanguage = useMemo(() => normalizeLanguage(locale), [locale]);
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
    dispatch(setLanguage(patchedLanguage));
  }, [dispatch, patchedLanguage]);

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

  const focusSendBoxContext = useMemo(() => createFocusSendBoxContext({ sendBoxRef }), [sendBoxRef]);

  const patchedStyleSet = useMemo(
    () => styleSetToClassNames({ ...(styleSet || createStyleSet(patchedStyleOptions)), ...extraStyleSet }),
    [extraStyleSet, patchedStyleOptions, styleSet]
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
    () => mergeStringsOverrides(getAllLocalizedStrings()[patchedLanguage], patchedLanguage, overrideLocalizedStrings),
    [overrideLocalizedStrings, patchedLanguage]
  );

  const localizedGlobalize = useMemo(() => {
    const { GLOBALIZE, GLOBALIZE_LANGUAGE } = patchedLocalizedStrings || {};

    return (
      GLOBALIZE || (GLOBALIZE_LANGUAGE && PrecompiledGlobalize(GLOBALIZE_LANGUAGE)) || PrecompiledGlobalize('en-US')
    );
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
      ...focusSendBoxContext,
      ...hoistedDispatchers,
      activityRenderer,
      activityStatusRenderer,
      attachmentRenderer,
      dictateAbortable,
      dir: patchedDir,
      directLine,
      disabled,
      grammars: patchedGrammars,
      internalMarkdownItState: [internalMarkdownIt],
      internalRenderMarkdownInline,
      language: patchedLanguage,
      localizedGlobalizeState: [localizedGlobalize],
      localizedStrings: patchedLocalizedStrings,
      onTelemetry,
      renderMarkdown,
      scrollToEnd,
      selectVoice: patchedSelectVoice,
      sendBoxRef,
      sendTypingIndicator,
      setDictateAbortable,
      trackDimension,
      styleOptions,
      styleSet: patchedStyleSet,
      telemetryDimensionsRef,
      toastRenderer,
      typingIndicatorRenderer,
      userID,
      username,
      webSpeechPonyfill
    }),
    [
      activityRenderer,
      activityStatusRenderer,
      attachmentRenderer,
      cardActionContext,
      dictateAbortable,
      directLine,
      disabled,
      focusSendBoxContext,
      hoistedDispatchers,
      internalMarkdownIt,
      internalRenderMarkdownInline,
      localizedGlobalize,
      onTelemetry,
      patchedDir,
      patchedGrammars,
      patchedLanguage,
      patchedLocalizedStrings,
      patchedSelectVoice,
      sendTypingIndicator,
      patchedStyleSet,
      renderMarkdown,
      scrollToEnd,
      sendBoxRef,
      setDictateAbortable,
      trackDimension,
      styleOptions,
      telemetryDimensionsRef,
      toastRenderer,
      typingIndicatorRenderer,
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
      const event = new Event('exception');

      event.error = error;
      event.fatal = true;

      onTelemetry && onTelemetry(event);
    },
    [onTelemetry]
  );

  const memoizedStore = useMemo(() => store || createStore(), [store]);

  return (
    <ErrorBoundary onError={handleError}>
      <Provider context={WebChatReduxContext} store={memoizedStore}>
        <ScrollToBottomComposer>
          <ScrollToBottomFunctionContext.Consumer>
            {({ scrollToEnd }) => <Composer onTelemetry={onTelemetry} scrollToEnd={scrollToEnd} {...props} />}
          </ScrollToBottomFunctionContext.Consumer>
        </ScrollToBottomComposer>
      </Provider>
    </ErrorBoundary>
  );
};

ComposeWithStore.defaultProps = {
  store: undefined
};

ComposeWithStore.propTypes = {
  store: PropTypes.any
};

export default ComposeWithStore;

// TODO: [P3] We should consider moving some data from Redux store to props
//       Although we use `connectToWebChat` to hide the details of accessor of Redux store,
//       we should clean up the responsibility between Context and Redux store
//       We should decide which data is needed for React but not in other environment such as CLI/VSCode

Composer.defaultProps = {
  activityRenderer: undefined,
  activityStatusRenderer: undefined,
  attachmentRenderer: undefined,
  cardActionMiddleware: undefined,
  children: undefined,
  dir: 'auto',
  disabled: false,
  extraStyleSet: undefined,
  grammars: [],
  groupTimestamp: undefined,
  locale: window.navigator.language || 'en-US',
  onTelemetry: undefined,
  overrideLocalizedStrings: undefined,
  renderMarkdown: undefined,
  selectVoice: undefined,
  sendBoxRef: undefined,
  sendTimeout: undefined,
  sendTypingIndicator: false,
  styleOptions: {},
  styleSet: undefined,
  toastRenderer: undefined,
  typingIndicatorRenderer: undefined,
  userID: '',
  username: '',
  webSpeechPonyfillFactory: undefined
};

Composer.propTypes = {
  activityRenderer: PropTypes.func,
  activityStatusRenderer: PropTypes.func,
  attachmentRenderer: PropTypes.func,
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
  groupTimestamp: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  locale: PropTypes.string,
  onTelemetry: PropTypes.func,
  overrideLocalizedStrings: PropTypes.oneOfType([PropTypes.any, PropTypes.func]),
  renderMarkdown: PropTypes.func,
  scrollToEnd: PropTypes.func.isRequired,
  selectVoice: PropTypes.func,
  sendBoxRef: PropTypes.shape({
    current: PropTypes.any
  }),
  sendTimeout: PropTypes.number,
  sendTypingIndicator: PropTypes.bool,
  styleOptions: PropTypes.any,
  styleSet: PropTypes.any,
  toastRenderer: PropTypes.func,
  typingIndicatorRenderer: PropTypes.func,
  userID: PropTypes.string,
  username: PropTypes.string,
  webSpeechPonyfillFactory: PropTypes.func
};
