import {
  clearSuggestedActions,
  connect as createConnectAction,
  createStoreWithOptions,
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
  setSendBoxAttachments,
  setSendTimeout,
  setSendTypingIndicator,
  singleToArray,
  startDictate,
  startSpeakingActivity,
  stopDictate,
  stopSpeakingActivity,
  submitSendBox,
  type DirectLineJSBotConnection,
  type GlobalScopePonyfill,
  type OneOrMany,
  type WebChatActivity
} from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import updateIn from 'simple-update-in';

import StyleOptions from '../StyleOptions';
import usePonyfill from '../hooks/usePonyfill';
import getAllLocalizedStrings from '../localization/getAllLocalizedStrings';
import normalizeStyleOptions from '../normalizeStyleOptions';
import patchStyleOptionsFromDeprecatedProps from '../patchStyleOptionsFromDeprecatedProps';
import ActivityAcknowledgementComposer from '../providers/ActivityAcknowledgement/ActivityAcknowledgementComposer';
import ActivityKeyerComposer from '../providers/ActivityKeyer/ActivityKeyerComposer';
import ActivityListenerComposer from '../providers/ActivityListener/ActivityListenerComposer';
import ActivitySendStatusComposer from '../providers/ActivitySendStatus/ActivitySendStatusComposer';
import ActivitySendStatusTelemetryComposer from '../providers/ActivitySendStatusTelemetry/ActivitySendStatusTelemetryComposer';
import ActivityTypingComposer from '../providers/ActivityTyping/ActivityTypingComposer';
import PonyfillComposer from '../providers/Ponyfill/PonyfillComposer';
import ActivityMiddleware from '../types/ActivityMiddleware';
import { type ActivityStatusMiddleware, type RenderActivityStatus } from '../types/ActivityStatusMiddleware';
import AttachmentForScreenReaderMiddleware from '../types/AttachmentForScreenReaderMiddleware';
import AttachmentMiddleware from '../types/AttachmentMiddleware';
import AvatarMiddleware from '../types/AvatarMiddleware';
import CardActionMiddleware from '../types/CardActionMiddleware';
import { type ContextOf } from '../types/ContextOf';
import GroupActivitiesMiddleware from '../types/GroupActivitiesMiddleware';
import LocalizedStrings from '../types/LocalizedStrings';
import PrecompiledGlobalizeType from '../types/PrecompiledGlobalize';
import ScrollToEndButtonMiddleware, { ScrollToEndButtonComponentFactory } from '../types/ScrollToEndButtonMiddleware';
import TelemetryMeasurementEvent, { TelemetryExceptionMeasurementEvent } from '../types/TelemetryMeasurementEvent';
import ToastMiddleware from '../types/ToastMiddleware';
import TypingIndicatorMiddleware from '../types/TypingIndicatorMiddleware';
import createCustomEvent from '../utils/createCustomEvent';
import isObject from '../utils/isObject';
import mapMap from '../utils/mapMap';
import normalizeLanguage from '../utils/normalizeLanguage';
import { SendBoxMiddlewareProvider, type SendBoxMiddleware } from './internal/SendBoxMiddleware';
import { SendBoxToolbarMiddlewareProvider, type SendBoxToolbarMiddleware } from './internal/SendBoxToolbarMiddleware';
import Tracker from './internal/Tracker';
import { default as WebChatAPIContext } from './internal/WebChatAPIContext';
import WebChatReduxContext, { useDispatch } from './internal/WebChatReduxContext';
import defaultSelectVoice from './internal/defaultSelectVoice';
import applyMiddleware, {
  forLegacyRenderer as applyMiddlewareForLegacyRenderer,
  forRenderer as applyMiddlewareForRenderer
} from './middleware/applyMiddleware';
import createDefaultCardActionMiddleware from './middleware/createDefaultCardActionMiddleware';
import createDefaultGroupActivitiesMiddleware from './middleware/createDefaultGroupActivitiesMiddleware';
import useMarkAllAsAcknowledged from './useMarkAllAsAcknowledged';
import ErrorBoundary from './utils/ErrorBoundary';
import observableToPromise from './utils/observableToPromise';

// PrecompileGlobalize is a generated file and is not ES module. TypeScript don't work with UMD.
// @ts-ignore
import PrecompiledGlobalize from '../external/PrecompiledGlobalize';
import { parseUIState } from './validation/uiState';

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
  setSendBoxAttachments,
  setSendTimeout,
  startDictate,
  startSpeakingActivity,
  stopDictate,
  stopSpeakingActivity,
  submitSendBox
};

const EMPTY_ARRAY: readonly [] = Object.freeze([]);

function createCardActionContext({
  cardActionMiddleware,
  directLine,
  dispatch,
  markAllAsAcknowledged,
  ponyfill
}: {
  cardActionMiddleware: readonly CardActionMiddleware[];
  directLine: DirectLineJSBotConnection;
  dispatch: Function;
  markAllAsAcknowledged: () => void;
  ponyfill: GlobalScopePonyfill;
}) {
  const runMiddleware = applyMiddleware(
    'card action',
    ...cardActionMiddleware,
    createDefaultCardActionMiddleware()
  )({ dispatch });

  return {
    onCardAction: (cardAction, { target }: { target?: any } = {}) => {
      markAllAsAcknowledged();

      return runMiddleware({
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
                  return observableToPromise(directLine.getSessionId(), ponyfill).then(
                    sessionId => `${value}${encodeURIComponent(`&code_challenge=${sessionId}`)}`
                  );
                }

                console.warn('botframework-webchat: OAuth is not supported on this Direct Line adapter.');

                return value;
              }
            : null,
        target
      });
    }
  };
}

function createGroupActivitiesContext({
  groupActivitiesMiddleware,
  groupTimestamp,
  ponyfill
}: {
  groupActivitiesMiddleware: readonly GroupActivitiesMiddleware[];
  groupTimestamp: boolean | number;
  ponyfill: GlobalScopePonyfill;
}) {
  const runMiddleware = applyMiddleware(
    'group activities',
    ...groupActivitiesMiddleware,
    createDefaultGroupActivitiesMiddleware({ groupTimestamp, ponyfill })
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

// It seems "react/require-default-props" did not pick up `ComposerCore.defaultProps`.
// And it falsely complaint `optional?: string` must have a corresponding `ComposerCore.defaultProps.optional = undefined`, even we already set it below.
// Since we set both TypeScript `Props` class and `ComposerCore.propTypes`, this check will be done there as well.
// Ignoring it in TypeScript version should be safe, as we have `propTypes` version to protect us.

type ComposerCoreProps = Readonly<{
  activityMiddleware?: OneOrMany<ActivityMiddleware>;
  activityStatusMiddleware?: OneOrMany<ActivityStatusMiddleware>;
  attachmentForScreenReaderMiddleware?: OneOrMany<AttachmentForScreenReaderMiddleware>;
  attachmentMiddleware?: OneOrMany<AttachmentMiddleware>;
  avatarMiddleware?: OneOrMany<AvatarMiddleware>;
  cardActionMiddleware?: OneOrMany<CardActionMiddleware>;
  children?: ReactNode | ((context: ContextOf<typeof WebChatAPIContext>) => ReactNode);
  dir?: string;
  directLine: DirectLineJSBotConnection;
  /**
   * @deprecated Please use `uiState="disabled"` instead. This feature will be removed on or after 2026-09-04.
   */
  disabled?: boolean;
  downscaleImageToDataURL?: (
    blob: Blob,
    maxWidth: number,
    maxHeight: number,
    type: string,
    quality: number
  ) => Promise<URL>;
  grammars?: any;
  groupActivitiesMiddleware?: OneOrMany<GroupActivitiesMiddleware>;
  internalErrorBoxClass?: React.Component | Function;
  locale?: string;
  onTelemetry?: (event: TelemetryMeasurementEvent) => void;
  overrideLocalizedStrings?: LocalizedStrings | ((strings: LocalizedStrings, language: string) => LocalizedStrings);
  renderMarkdown?: (
    markdown: string,
    newLineOptions: { markdownRespectCRLF: boolean },
    linkOptions: { externalLinkAlt: string }
  ) => string;
  scrollToEndButtonMiddleware?: OneOrMany<ScrollToEndButtonMiddleware>;
  selectVoice?: (voices: (typeof window.SpeechSynthesisVoice)[], activity: WebChatActivity) => void;
  sendBoxMiddleware?: readonly SendBoxMiddleware[] | undefined;
  sendBoxToolbarMiddleware?: readonly SendBoxToolbarMiddleware[] | undefined;
  sendTypingIndicator?: boolean;
  styleOptions?: StyleOptions;
  toastMiddleware?: OneOrMany<ToastMiddleware>;
  typingIndicatorMiddleware?: OneOrMany<TypingIndicatorMiddleware>;
  /**
   * Sets the state of the UI.
   *
   * - `undefined` will render normally
   * - `"blueprint"` will render as few UI elements as possible and should be non-functional
   *   - Useful for loading scenarios
   * - `"disabled"` will render most UI elements as non-functional
   *   - Scrolling may continue to trigger read acknowledgements
   */
  uiState?: 'blueprint' | 'disabled' | undefined;
  userID?: string;
  username?: string;
}>;

const ComposerCore = ({
  activityMiddleware,
  activityStatusMiddleware,
  attachmentForScreenReaderMiddleware,
  attachmentMiddleware,
  avatarMiddleware,
  cardActionMiddleware,
  children,
  dir,
  directLine,
  disabled,
  downscaleImageToDataURL,
  grammars,
  groupActivitiesMiddleware,
  internalErrorBoxClass,
  locale,
  onTelemetry,
  overrideLocalizedStrings,
  renderMarkdown,
  scrollToEndButtonMiddleware,
  selectVoice,
  sendBoxMiddleware,
  sendBoxToolbarMiddleware,
  sendTypingIndicator,
  styleOptions,
  toastMiddleware,
  typingIndicatorMiddleware,
  uiState,
  userID,
  username
}: ComposerCoreProps) => {
  const [ponyfill] = usePonyfill();
  const dispatch = useDispatch();
  const telemetryDimensionsRef = useRef({});

  const patchedDir = useMemo(() => (dir === 'ltr' || dir === 'rtl' ? dir : 'auto'), [dir]);
  const patchedGrammars = useMemo(() => grammars || [], [grammars]);
  const patchedStyleOptions = useMemo(
    () => normalizeStyleOptions(patchStyleOptionsFromDeprecatedProps(styleOptions)),
    [styleOptions]
  );

  uiState = parseUIState(uiState, disabled);

  useEffect(() => {
    dispatch(setLanguage(locale));
  }, [dispatch, locale]);

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

  const markAllAsAcknowledged = useMarkAllAsAcknowledged();

  const cardActionContext = useMemo(
    () =>
      createCardActionContext({
        cardActionMiddleware: Object.freeze([...singleToArray(cardActionMiddleware)]),
        directLine,
        dispatch,
        markAllAsAcknowledged,
        ponyfill
      }),
    [cardActionMiddleware, directLine, dispatch, markAllAsAcknowledged, ponyfill]
  );

  const patchedSelectVoice = useMemo(
    () => selectVoice || defaultSelectVoice.bind(null, { language: locale }),
    [locale, selectVoice]
  );

  const groupActivitiesContext = useMemo(
    () =>
      createGroupActivitiesContext({
        groupActivitiesMiddleware: Object.freeze([...singleToArray(groupActivitiesMiddleware)]),
        groupTimestamp: patchedStyleOptions.groupTimestamp,
        ponyfill
      }),
    [groupActivitiesMiddleware, patchedStyleOptions.groupTimestamp, ponyfill]
  );

  const hoistedDispatchers = useMemo(
    () =>
      mapMap(
        DISPATCHERS,
        dispatcher =>
          (...args) =>
            // @ts-expect-error
            dispatch(dispatcher(...args))
      ),
    [dispatch]
  );

  const patchedLocalizedStrings = useMemo(
    () => mergeStringsOverrides(getAllLocalizedStrings()[normalizeLanguage(locale)], locale, overrideLocalizedStrings),
    [locale, overrideLocalizedStrings]
  );

  const localizedGlobalize = useMemo<PrecompiledGlobalizeType>(() => {
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

  const patchedActivityRenderer = useMemo(
    () =>
      applyMiddlewareForRenderer(
        'activity',
        { strict: false },
        ...singleToArray(activityMiddleware),
        () =>
          () =>
          ({ activity }) => {
            if (activity) {
              throw new Error(`No renderer for activity of type "${activity.type}"`);
            } else {
              throw new Error('No activity to render');
            }
          }
      )({}),
    [activityMiddleware]
  );

  const patchedActivityStatusRenderer = useMemo<RenderActivityStatus>(
    () =>
      applyMiddlewareForRenderer(
        'activity status',
        { strict: false },
        ...singleToArray(activityStatusMiddleware),
        () => () => () => false
      )({}),
    [activityStatusMiddleware]
  );

  const patchedAttachmentForScreenReaderRenderer = useMemo(
    () =>
      applyMiddlewareForRenderer(
        'attachment for screen reader',
        { strict: true },
        ...singleToArray(attachmentForScreenReaderMiddleware),
        () =>
          () =>
          ({ attachment }) => {
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

  const patchedAttachmentRenderer = useMemo(
    () =>
      applyMiddlewareForLegacyRenderer(
        'attachment',
        ...singleToArray(attachmentMiddleware),
        () =>
          () =>
          ({ attachment }) => {
            if (attachment) {
              throw new Error(`No renderer for attachment of type "${attachment.contentType}"`);
            } else {
              throw new Error('No attachment to render');
            }
          }
      )({}),
    [attachmentMiddleware]
  );

  const patchedAvatarRenderer = useMemo(
    () =>
      applyMiddlewareForRenderer(
        'avatar',
        { strict: false },
        ...singleToArray(avatarMiddleware),
        () => () => () => false
      )({}),
    [avatarMiddleware]
  );

  const patchedToastRenderer = useMemo(
    () =>
      applyMiddlewareForRenderer(
        'toast',
        { strict: false },
        ...singleToArray(toastMiddleware),
        () =>
          () =>
          ({ notification }) => {
            if (notification) {
              throw new Error(`No renderer for notification of type "${notification.contentType}"`);
            } else {
              throw new Error('No notification to render');
            }
          }
      )({}),
    [toastMiddleware]
  );

  const patchedTypingIndicatorRenderer = useMemo(
    () =>
      applyMiddlewareForRenderer(
        'typing indicator',
        { strict: false },
        ...singleToArray(typingIndicatorMiddleware),
        () => () => () => false
      )({}),
    [typingIndicatorMiddleware]
  );

  const scrollToEndButtonRenderer: ScrollToEndButtonComponentFactory = useMemo(
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
  const context = useMemo<ContextOf<typeof WebChatAPIContext>>(
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
      uiState,
      userID,
      username
    }),
    [
      cardActionContext,
      directLine,
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
      uiState,
      userID,
      username
    ]
  );

  return (
    <WebChatAPIContext.Provider value={context}>
      <ActivityListenerComposer>
        <ActivitySendStatusComposer>
          <ActivityTypingComposer>
            <SendBoxMiddlewareProvider middleware={sendBoxMiddleware || EMPTY_ARRAY}>
              <SendBoxToolbarMiddlewareProvider middleware={sendBoxToolbarMiddleware || EMPTY_ARRAY}>
                {typeof children === 'function' ? children(context) : children}
                <ActivitySendStatusTelemetryComposer />
              </SendBoxToolbarMiddlewareProvider>
            </SendBoxMiddlewareProvider>
          </ActivityTypingComposer>
        </ActivitySendStatusComposer>
      </ActivityListenerComposer>
      {onTelemetry && <Tracker />}
    </WebChatAPIContext.Provider>
  );
};

/**
 * @todo TODO: [P3] We should consider moving some data from Redux store to props
 *       Although we use `connectToWebChat` to hide the details of accessor of Redux store,
 *       we should clean up the responsibility between Context and Redux store
 *       We should decide which data is needed for React but not in other environment such as CLI/VSCode
 */
ComposerCore.defaultProps = {
  activityMiddleware: undefined,
  activityStatusMiddleware: undefined,
  attachmentForScreenReaderMiddleware: undefined,
  attachmentMiddleware: undefined,
  avatarMiddleware: undefined,
  cardActionMiddleware: undefined,
  children: undefined,
  dir: 'auto',
  disabled: false,
  downscaleImageToDataURL: undefined,
  grammars: [],
  groupActivitiesMiddleware: undefined,
  internalErrorBoxClass: undefined,
  locale: window.navigator.language || 'en-US',
  onTelemetry: undefined,
  overrideLocalizedStrings: undefined,
  renderMarkdown: undefined,
  scrollToEndButtonMiddleware: undefined,
  selectVoice: undefined,
  sendTypingIndicator: false,
  styleOptions: {},
  toastMiddleware: undefined,
  typingIndicatorMiddleware: undefined,
  uiState: undefined,
  userID: '',
  username: ''
};

ComposerCore.propTypes = {
  activityMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  activityStatusMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  attachmentForScreenReaderMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  attachmentMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  avatarMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  cardActionMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  children: PropTypes.any,
  dir: PropTypes.oneOf(['auto', 'ltr', 'rtl']),
  // PropTypes.shape({ ... }) did not honor isRequired for its members.
  // @ts-ignore
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
  internalErrorBoxClass: PropTypes.func, // This is for internal use only. We don't allow customization of error box.
  locale: PropTypes.string,
  onTelemetry: PropTypes.func,
  overrideLocalizedStrings: PropTypes.oneOfType([PropTypes.any, PropTypes.func]),
  renderMarkdown: PropTypes.func,
  scrollToEndButtonMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  selectVoice: PropTypes.func,
  sendTypingIndicator: PropTypes.bool,
  styleOptions: PropTypes.any,
  toastMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  typingIndicatorMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  uiState: PropTypes.oneOf(['blueprint', 'disabled']),
  userID: PropTypes.string,
  username: PropTypes.string
};

type ComposerWithStoreProps = ComposerCoreProps &
  Readonly<{
    store?: any;
  }>;

type ComposerProps = ComposerWithStoreProps & {
  internalRenderErrorBox?: any;

  /**
   * Ponyfill to overrides specific global scope members. This prop cannot be changed after initial render.
   *
   * This option is for development use only. Not all features in Web Chat are ponyfilled.
   *
   * To fake timers, `setTimeout` and related functions can be passed to overrides the original global scope members.
   *
   * Please see [#4662](https://github.com/microsoft/BotFramework-WebChat/pull/4662) for details.
   */
  ponyfill?: Partial<GlobalScopePonyfill>;
};

// We will create a Redux store if it was not passed in
const ComposerWithStore = ({ onTelemetry, store, ...props }: ComposerWithStoreProps) => {
  const [ponyfill] = usePonyfill();

  const memoizedStore = useMemo(() => {
    const nextStore = store || createStoreWithOptions({ ponyfill });

    const storePonyfill = nextStore.getState().internal?.ponyfill || {};

    const keys = new Set([...Object.keys(storePonyfill), ...Object.keys(ponyfill)]);

    // Filter out forbidden properties.
    keys.delete('prototype');

    Object.getOwnPropertyNames(Object.prototype).forEach(key => {
      keys.delete(key);
    });

    const nativeFunction = (fn: (...args: unknown[]) => unknown): boolean =>
      typeof fn === 'function' && ('' + fn).endsWith('() { [native code] }');

    const ponyfillFunctionEquals = (x: (...args: unknown[]) => unknown, y: (...args: unknown[]) => unknown) =>
      (nativeFunction(x) && nativeFunction(y)) || x === y;

    // We have filtered out all forbidden properties.
    // eslint-disable-next-line security/detect-object-injection
    const differentKeys = Array.from(keys).filter(key => !ponyfillFunctionEquals(storePonyfill[key], ponyfill[key]));

    if (differentKeys.length) {
      console.warn(
        `botframework-webchat: Ponyfill used in store should match the ponyfill passed in props: ${differentKeys.join(
          ', '
        )}`
      );
    }

    return nextStore;
  }, [ponyfill, store]);

  return (
    <Provider context={WebChatReduxContext} store={memoizedStore}>
      <ActivityKeyerComposer>
        <ActivityAcknowledgementComposer>
          <ComposerCore onTelemetry={onTelemetry} {...props} />
        </ActivityAcknowledgementComposer>
      </ActivityKeyerComposer>
    </Provider>
  );
};

ComposerWithStore.defaultProps = {
  onTelemetry: undefined,
  store: undefined
};

ComposerWithStore.propTypes = {
  onTelemetry: PropTypes.func,
  store: PropTypes.any
};

const Composer = ({ internalRenderErrorBox, onTelemetry, ponyfill, ...props }: ComposerProps) => {
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

  return error ? (
    !!internalRenderErrorBox && internalRenderErrorBox({ error, type: 'uncaught exception' })
  ) : (
    <ErrorBoundary onError={handleError}>
      <PonyfillComposer ponyfill={ponyfill}>
        <ComposerWithStore onTelemetry={onTelemetry} {...props} />
      </PonyfillComposer>
    </ErrorBoundary>
  );
};

Composer.defaultProps = {
  ...ComposerWithStore.defaultProps,
  internalRenderErrorBox: undefined,
  onTelemetry: undefined,
  ponyfill: undefined
};

Composer.propTypes = {
  ...ComposerWithStore.propTypes,
  internalRenderErrorBox: PropTypes.any,
  onTelemetry: PropTypes.func,
  ponyfill: PropTypes.any
};

export default Composer;

export type { ComposerProps };
