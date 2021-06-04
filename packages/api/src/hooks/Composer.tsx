import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import updateIn from 'simple-update-in';

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

import { default as WebChatAPIContext } from './internal/WebChatAPIContext';
import ActivityMiddleware from '../types/ActivityMiddleware';
import createCustomEvent from '../utils/createCustomEvent';
import createDefaultCardActionMiddleware from './middleware/createDefaultCardActionMiddleware';
import createDefaultGroupActivitiesMiddleware from './middleware/createDefaultGroupActivitiesMiddleware';
import defaultSelectVoice from './internal/defaultSelectVoice';
import DirectLineActivity from '../types/external/DirectLineActivity';
import DirectLineJSBotConnection from '../types/external/DirectLineJSBotConnection';
import ErrorBoundary from './utils/ErrorBoundary';
import getAllLocalizedStrings from '../localization/getAllLocalizedStrings';
import GroupActivitiesMiddleware from '../types/GroupActivitiesMiddleware';
import isObject from '../utils/isObject';
import LocalizedStrings from '../types/LocalizedStrings';
import mapMap from '../utils/mapMap';
import normalizeLanguage from '../utils/normalizeLanguage';
import normalizeStyleOptions from '../normalizeStyleOptions';
import observableToPromise from './utils/observableToPromise';
import OneOrMany from '../types/OneOrMany';
import patchStyleOptionsFromDeprecatedProps from '../patchStyleOptionsFromDeprecatedProps';
import ScrollToEndButtonMiddleware from '../types/ScrollToEndButtonMiddleware';
import singleToArray from './utils/singleToArray';
import StyleOptions from '../StyleOptions';
import TelemetryMeasurementEvent, { TelemetryExceptionMeasurementEvent } from '../types/TelemetryMeasurementEvent';
import Tracker from './internal/Tracker';
import WebChatReduxContext, { useDispatch } from './internal/WebChatReduxContext';

import applyMiddleware, {
  forLegacyRenderer as applyMiddlewareForLegacyRenderer,
  forRenderer as applyMiddlewareForRenderer
} from './middleware/applyMiddleware';

// @ts-ignore
import PrecompiledGlobalize from '../external/PrecompiledGlobalize';

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

function createCardActionContext({ cardActionMiddleware, directLine, dispatch }) {
  const runMiddleware = applyMiddleware(
    'card action',
    ...singleToArray(cardActionMiddleware),
    createDefaultCardActionMiddleware()
  )({ dispatch });

  return {
    onCardAction: (cardAction, { target }: { target?: any } = {}) =>
      runMiddleware({
        cardAction,
        getSignInUrl:
          cardAction.type === 'signin'
            ? () => {
                const { value } = cardAction;

                if (directLine.getSessionId) {
                  /**
                   * @todo TODO: [P3] We should change this one to async/await.
                   *       This is the first place in this project to use async.
                   *       Thus, we need to add @babel/plugin-transform-runtime and @babel/runtime.
                   */
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

function createGroupActivitiesContext({ groupActivitiesMiddleware, groupTimestamp }) {
  const runMiddleware = applyMiddleware(
    'group activities',
    ...singleToArray(groupActivitiesMiddleware),
    createDefaultGroupActivitiesMiddleware({ groupTimestamp })
  );

  return {
    groupActivities: runMiddleware({})
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

type ComposerProps = {
  activityMiddleware?: OneOrMany<ActivityMiddleware>;
  activityStatusMiddleware?: OneOrMany<Function>;
  attachmentForScreenReaderMiddleware?: OneOrMany<Function>;
  attachmentMiddleware?: OneOrMany<Function>;
  avatarMiddleware?: OneOrMany<Function>;
  cardActionMiddleware?: OneOrMany<Function>;
  children?: ReactNode;
  dir?: string;
  directLine: DirectLineJSBotConnection;
  disabled?: boolean;
  downscaleImageToDataURL?: (blob: Blob, maxWidth: number, maxHeight: number, type: string, quality: number) => string;
  grammars?: any;
  groupActivitiesMiddleware?: OneOrMany<GroupActivitiesMiddleware>;
  internalErrorBoxClass?: React.Component | Function;
  internalRenderErrorBox?: any;
  locale?: string;
  onTelemetry?: (event: TelemetryMeasurementEvent) => void;
  overrideLocalizedStrings?: LocalizedStrings | ((strings: LocalizedStrings, language: string) => LocalizedStrings);
  renderMarkdown?: (markdown: string, { markdownRespectCRLF: boolean }, { externalLinkAlt: string }) => string;
  scrollToEndButtonMiddleware: OneOrMany<ScrollToEndButtonMiddleware>;
  selectVoice?: (voices: typeof window.SpeechSynthesisVoice[], activity: DirectLineActivity) => void;
  sendTypingIndicator?: boolean;
  styleOptions?: StyleOptions;
  toastMiddleware?: OneOrMany<Function>;
  typingIndicatorMiddleware?: OneOrMany<Function>;
  userID?: string;
  username?: string;

  /** @deprecated Please use "activityMiddleware" instead. */
  activityRenderer?: any; // TODO: [P4] Remove on or after 2022-06-15.
  /** @deprecated Please use "activityStatusMiddleware" instead. */
  activityStatusRenderer?: any; // TODO: [P4] Remove on or after 2022-06-15.
  /** @deprecated Please use "attachmentMiddleware" instead. */
  attachmentRenderer?: any; // TODO: [P4] Remove on or after 2022-06-15.
  /** @deprecated Please use "avatarMiddleware" instead. */
  avatarRenderer?: any; // TODO: [P4] Remove on or after 2022-06-15.
  /** @deprecated Please use "styleOptions.groupTimestamp" instead. */
  groupTimestamp?: boolean | number; // TODO: [P4] Remove on or after 2022-01-01
  /** @deprecated Please use "styleOptions.sendTimeout" instead. */
  sendTimeout?: number; // TODO: [P4] Remove on or after 2022-01-01.
  /** @deprecated Please use "toastMiddleware" instead. */
  toastRenderer?: any; // TODO: [P4] Remove on or after 2022-06-15.
  /** @deprecated Please use "typingIndicatorRenderer" instead. */
  typingIndicatorRenderer?: any; // TODO: [P4] Remove on or after 2022-06-15.
};

const Composer: FC<ComposerProps> = ({
  activityMiddleware,
  activityRenderer,
  activityStatusMiddleware,
  activityStatusRenderer,
  attachmentMiddleware,
  attachmentForScreenReaderMiddleware,
  attachmentRenderer,
  avatarMiddleware,
  avatarRenderer,
  cardActionMiddleware,
  children,
  dir,
  directLine,
  disabled,
  downscaleImageToDataURL,
  grammars,
  groupActivitiesMiddleware,
  groupTimestamp,
  internalErrorBoxClass,
  locale,
  onTelemetry,
  overrideLocalizedStrings,
  renderMarkdown,
  scrollToEndButtonMiddleware,
  selectVoice,
  sendTimeout,
  sendTypingIndicator,
  styleOptions,
  toastMiddleware,
  toastRenderer,
  typingIndicatorMiddleware,
  typingIndicatorRenderer,
  userID,
  username
}) => {
  const dispatch = useDispatch();
  const telemetryDimensionsRef = useRef({});

  const patchedDir = useMemo(() => (dir === 'ltr' || dir === 'rtl' ? dir : 'auto'), [dir]);
  const patchedGrammars = useMemo(() => grammars || [], [grammars]);
  const patchedStyleOptions = useMemo(
    () => normalizeStyleOptions(patchStyleOptionsFromDeprecatedProps(styleOptions, { groupTimestamp, sendTimeout })),
    [groupTimestamp, sendTimeout, styleOptions]
  );

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
      /**
       * @todo TODO: [P3] disconnect() is an async call (pending -> fulfilled), we need to wait, or change it to reconnect()
       */
      dispatch(disconnect());
    };
  }, [dispatch, directLine, userID, username]);

  const cardActionContext = useMemo(() => createCardActionContext({ cardActionMiddleware, directLine, dispatch }), [
    cardActionMiddleware,
    directLine,
    dispatch
  ]);

  const patchedSelectVoice = useMemo(() => selectVoice || defaultSelectVoice.bind(null, { language: locale }), [
    locale,
    selectVoice
  ]);

  const groupActivitiesContext = useMemo(
    () =>
      createGroupActivitiesContext({
        groupActivitiesMiddleware,
        groupTimestamp: patchedStyleOptions.groupTimestamp
      }),
    [groupActivitiesMiddleware, patchedStyleOptions.groupTimestamp]
  );

  const hoistedDispatchers = useMemo(
    () => mapMap(DISPATCHERS, dispatcher => (...args) => dispatch(dispatcher(...args))),
    [dispatch]
  );

  const patchedLocalizedStrings = useMemo(
    () => mergeStringsOverrides(getAllLocalizedStrings()[normalizeLanguage(locale)], locale, overrideLocalizedStrings),
    [locale, overrideLocalizedStrings]
  );

  const localizedGlobalize = useMemo(() => {
    const { GLOBALIZE, GLOBALIZE_LANGUAGE } = patchedLocalizedStrings || {};

    return GLOBALIZE || (GLOBALIZE_LANGUAGE && PrecompiledGlobalize(GLOBALIZE_LANGUAGE)) || PrecompiledGlobalize('en');
  }, [patchedLocalizedStrings]);

  const trackDimension = useCallback(
    (name: string, data: any) => {
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
        'Web Chat: "activityRenderer" is deprecated and will be removed on 2022-06-15, please use "activityMiddleware" instead.'
      );

    return (
      activityRenderer ||
      applyMiddlewareForRenderer(
        'activity',
        { strict: false },
        ...singleToArray(activityMiddleware),
        () => () => ({ activity }) => {
          if (activity) {
            throw new Error(`No renderer for activity of type "${activity.type}"`);
          } else {
            throw new Error('No activity to render');
          }
        }
      )({})
    );
  }, [activityMiddleware, activityRenderer]);

  const patchedActivityStatusRenderer = useMemo(() => {
    activityStatusRenderer &&
      console.warn(
        'Web Chat: "activityStatusRenderer" is deprecated and will be removed on 2022-06-15, please use "activityStatusMiddleware" instead.'
      );

    return (
      activityStatusRenderer ||
      applyMiddlewareForRenderer(
        'activity status',
        { strict: false },
        ...singleToArray(activityStatusMiddleware),
        () => () => () => false
      )({})
    );
  }, [activityStatusMiddleware, activityStatusRenderer]);

  const patchedAttachmentForScreenReaderRenderer = useMemo(
    () =>
      applyMiddlewareForRenderer(
        'attachment for screen reader',
        { strict: true },
        ...singleToArray(attachmentForScreenReaderMiddleware),
        () => () => ({ attachment }) => {
          if (attachment) {
            console.warn(`No renderer for attachment for screen reader of type "${attachment.contentType}"`);
            return false;
          }

          return () => {
            /**
             * @todo TODO: [P4] Might be able to throw without returning a function -- investigate and possibly fix
             */
            throw new Error('No attachment to render');
          };
        }
      )({}),
    [attachmentForScreenReaderMiddleware]
  );

  const patchedAttachmentRenderer = useMemo(() => {
    if (attachmentRenderer) {
      console.warn(
        'Web Chat: "attachmentRenderer" is deprecated and will be removed on 2022-06-15, please use "attachmentMiddleware" instead.'
      );

      return attachmentRenderer;
    }

    // Attachment renderer
    return applyMiddlewareForLegacyRenderer(
      'attachment',
      ...singleToArray(attachmentMiddleware),
      () => () => ({ attachment }) => {
        if (attachment) {
          throw new Error(`No renderer for attachment of type "${attachment.contentType}"`);
        } else {
          throw new Error('No attachment to render');
        }
      }
    )({});
  }, [attachmentMiddleware, attachmentRenderer]);

  const patchedAvatarRenderer = useMemo(() => {
    avatarRenderer &&
      console.warn(
        'Web Chat: "avatarRenderer" is deprecated and will be removed on 2022-06-15, please use "avatarMiddleware" instead.'
      );

    return (
      avatarRenderer ||
      applyMiddlewareForRenderer('avatar', { strict: false }, ...singleToArray(avatarMiddleware), () => () => () =>
        false
      )({})
    );
  }, [avatarMiddleware, avatarRenderer]);

  const patchedToastRenderer = useMemo(() => {
    toastRenderer &&
      console.warn(
        'Web Chat: "toastRenderer" is deprecated and will be removed on 2022-06-15, please use "toastMiddleware" instead.'
      );

    return (
      toastRenderer ||
      applyMiddlewareForRenderer(
        'toast',
        { strict: false },
        ...singleToArray(toastMiddleware),
        () => () => ({ notification }) => {
          if (notification) {
            throw new Error(`No renderer for notification of type "${notification.contentType}"`);
          } else {
            throw new Error('No notification to render');
          }
        }
      )({})
    );
  }, [toastMiddleware, toastRenderer]);

  const patchedTypingIndicatorRenderer = useMemo(() => {
    typingIndicatorRenderer &&
      console.warn(
        'Web Chat: "typingIndicatorRenderer" is deprecated and will be removed on 2022-06-15, please use "typingIndicatorMiddleware" instead.'
      );

    return (
      typingIndicatorRenderer ||
      applyMiddlewareForRenderer(
        'typing indicator',
        { strict: false },
        ...singleToArray(typingIndicatorMiddleware),
        () => () => () => false
      )({})
    );
  }, [typingIndicatorMiddleware, typingIndicatorRenderer]);

  const scrollToEndButtonRenderer: ScrollToEndButtonMiddleware = useMemo(
    () =>
      applyMiddlewareForRenderer(
        'scroll to end button',
        { strict: true },
        ...singleToArray(scrollToEndButtonMiddleware),
        () => () => () => false
      )() as any,
    [scrollToEndButtonMiddleware]
  );

  /**
   * This is a heavy function, and it is expected to be only called when there is a need to recreate business logic, e.g.
   * - User ID changed, causing all send* functions to be updated
   * - send
   * @todo TODO: [P3] We should think about if we allow the user to change onSendBoxValueChanged/sendBoxValue, e.g.
   * 1. Turns text into UPPERCASE
   * 2. Filter out profanity
   * @todo TODO: [P4] Revisit all members of context
   *       This context should consist of members that are not in the Redux store
   *       i.e. members that are not interested in other types of UIs
   */
  const context = useMemo(
    () => ({
      ...cardActionContext,
      ...groupActivitiesContext,
      ...hoistedDispatchers,
      activityRenderer: patchedActivityRenderer,
      activityStatusRenderer: patchedActivityStatusRenderer,
      attachmentForScreenReaderRenderer: patchedAttachmentForScreenReaderRenderer,
      attachmentRenderer: patchedAttachmentRenderer,
      avatarRenderer: patchedAvatarRenderer,
      dir: patchedDir,
      directLine,
      disabled,
      downscaleImageToDataURL,
      grammars: patchedGrammars,
      internalErrorBoxClass,
      language: locale,
      localizedGlobalizeState: [localizedGlobalize],
      localizedStrings: patchedLocalizedStrings,
      onTelemetry,
      renderMarkdown,
      scrollToEndButtonRenderer,
      selectVoice: patchedSelectVoice,
      sendTypingIndicator,
      styleOptions: patchedStyleOptions,
      telemetryDimensionsRef,
      toastRenderer: patchedToastRenderer,
      trackDimension,
      typingIndicatorRenderer: patchedTypingIndicatorRenderer,
      userID,
      username
    }),
    [
      cardActionContext,
      directLine,
      disabled,
      downscaleImageToDataURL,
      groupActivitiesContext,
      hoistedDispatchers,
      internalErrorBoxClass,
      locale,
      localizedGlobalize,
      onTelemetry,
      patchedActivityRenderer,
      patchedActivityStatusRenderer,
      patchedAttachmentForScreenReaderRenderer,
      patchedAttachmentRenderer,
      patchedAvatarRenderer,
      patchedDir,
      patchedGrammars,
      patchedLocalizedStrings,
      patchedSelectVoice,
      patchedStyleOptions,
      patchedToastRenderer,
      patchedTypingIndicatorRenderer,
      renderMarkdown,
      scrollToEndButtonRenderer,
      sendTypingIndicator,
      telemetryDimensionsRef,
      trackDimension,
      userID,
      username
    ]
  );

  return (
    <WebChatAPIContext.Provider value={context}>
      {typeof children === 'function' ? children(context) : children}
      {onTelemetry && <Tracker />}
    </WebChatAPIContext.Provider>
  );
};

// We will create a Redux store if it was not passed in
const ComposeWithStore: FC<ComposerProps & { store: any }> = ({
  internalRenderErrorBox,
  onTelemetry,
  store,
  ...props
}) => {
  const [error, setError] = useState();

  const handleError = useCallback(
    error => {
      console.error('botframework-webchat: Uncaught exception', { error });

      onTelemetry &&
        onTelemetry(createCustomEvent('exception', { error, fatal: true }) as TelemetryExceptionMeasurementEvent);
      setError(error);
    },
    [onTelemetry, setError]
  );

  const memoizedStore = useMemo(() => store || createStore(), [store]);

  return error ? (
    !!internalRenderErrorBox && internalRenderErrorBox({ error, type: 'uncaught exception' })
  ) : (
    <ErrorBoundary onError={handleError}>
      <Provider context={WebChatReduxContext} store={memoizedStore}>
        <Composer internalRenderErrorBox={internalRenderErrorBox} onTelemetry={onTelemetry} {...props} />
      </Provider>
    </ErrorBoundary>
  );
};

ComposeWithStore.defaultProps = {
  internalRenderErrorBox: undefined,
  onTelemetry: undefined,
  store: undefined
};

ComposeWithStore.propTypes = {
  internalRenderErrorBox: PropTypes.any,
  onTelemetry: PropTypes.func,
  store: PropTypes.any
};

export default ComposeWithStore;

/**
 * @todo TODO: [P3] We should consider moving some data from Redux store to props
 *       Although we use `connectToWebChat` to hide the details of accessor of Redux store,
 *       we should clean up the responsibility between Context and Redux store
 *       We should decide which data is needed for React but not in other environment such as CLI/VSCode
 */
Composer.defaultProps = {
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
  dir: 'auto',
  disabled: false,
  downscaleImageToDataURL: undefined,
  grammars: [],
  groupActivitiesMiddleware: undefined,
  groupTimestamp: undefined,
  internalErrorBoxClass: undefined,
  locale: window.navigator.language || 'en-US',
  onTelemetry: undefined,
  overrideLocalizedStrings: undefined,
  renderMarkdown: undefined,
  scrollToEndButtonMiddleware: undefined,
  selectVoice: undefined,
  sendTimeout: undefined,
  sendTypingIndicator: false,
  styleOptions: {},
  toastMiddleware: undefined,
  toastRenderer: undefined,
  typingIndicatorMiddleware: undefined,
  typingIndicatorRenderer: undefined,
  userID: '',
  username: ''
};

Composer.propTypes = {
  activityMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  activityRenderer: PropTypes.func,
  activityStatusMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  activityStatusRenderer: PropTypes.func,
  attachmentForScreenReaderMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  attachmentMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  attachmentRenderer: PropTypes.func,
  avatarMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  avatarRenderer: PropTypes.func,
  cardActionMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
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
  downscaleImageToDataURL: PropTypes.func,
  grammars: PropTypes.arrayOf(PropTypes.string),
  groupActivitiesMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  groupTimestamp: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  internalErrorBoxClass: PropTypes.func, // This is for internal use only. We don't allow customization of error box.
  locale: PropTypes.string,
  onTelemetry: PropTypes.func,
  overrideLocalizedStrings: PropTypes.oneOfType([PropTypes.any, PropTypes.func]),
  renderMarkdown: PropTypes.func,
  scrollToEndButtonMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  selectVoice: PropTypes.func,
  sendTimeout: PropTypes.number,
  sendTypingIndicator: PropTypes.bool,
  styleOptions: PropTypes.any,
  toastMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  toastRenderer: PropTypes.func,
  typingIndicatorMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  typingIndicatorRenderer: PropTypes.func,
  userID: PropTypes.string,
  username: PropTypes.string
};
