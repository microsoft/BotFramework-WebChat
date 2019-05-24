import {
  Composer as ScrollToBottomComposer,
  FunctionContext as ScrollToBottomFunctionContext
} from 'react-scroll-to-bottom';

import { connect } from 'react-redux';
import { css } from 'glamor';
import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import {
  connect as createConnectAction,
  createStore,
  disconnect,
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
  setSendBox,
  setSendTimeout,
  setSendTypingIndicator,
  startDictate,
  startSpeakingActivity,
  stopDictate,
  stopSpeakingActivity,
  submitSendBox
} from 'botframework-webchat-core';

import concatMiddleware from './Middleware/concatMiddleware';
import Context from './Context';
import createCoreCardActionMiddleware from './Middleware/CardAction/createCoreMiddleware';
import createStyleSet from './Styles/createStyleSet';
import Dictation from './Dictation';
import mapMap from './Utils/mapMap';
import observableToPromise from './Utils/observableToPromise';
import shallowEquals from './Utils/shallowEquals';

// Flywheel object
const EMPTY_ARRAY = [];

const DISPATCHERS = {
  markActivity,
  postActivity,
  sendEvent,
  sendFiles,
  sendMessage,
  sendMessageBack,
  sendPostBack,
  setDictateInterims,
  setDictateState,
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

function createCardActionLogic({ cardActionMiddleware, directLine, dispatch }) {
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

                return value;
              }
            : null
      })
  };
}

function createFocusSendBoxLogic({ sendBoxRef }) {
  return {
    focusSendBox: () => {
      const { current } = sendBoxRef || {};

      current && current.focus();
    }
  };
}

function createStyleSetLogic({ styleOptions, styleSet }) {
  return {
    styleSet: styleSetToClassNames(styleSet || createStyleSet(styleOptions))
  };
}

// TODO: [P3] Take this deprecation code out when releasing on or after 2019 December 11
function patchPropsForAvatarInitials({ botAvatarInitials, userAvatarInitials, ...props }) {
  // This code will take out "botAvatarInitials" and "userAvatarInitials" from props

  let { styleOptions } = props;

  if (botAvatarInitials) {
    styleOptions = { ...styleOptions, botAvatarInitials };

    console.warn(
      'Web Chat: "botAvatarInitials" is deprecated. Please use "styleOptions.botAvatarInitials" instead. "botAvatarInitials" will be removed on or after December 11 2019 .'
    );
  }

  if (userAvatarInitials) {
    styleOptions = { ...styleOptions, userAvatarInitials };

    console.warn(
      'Web Chat: "botAvatarInitials" is deprecated. Please use "styleOptions.botAvatarInitials" instead. "botAvatarInitials" will be removed on or after December 11 2019 .'
    );
  }

  return {
    ...props,
    styleOptions
  };
}

function createLogic(props) {
  // This is a heavy function, and it is expected to be only called when there is a need to recreate business logic, e.g.
  // - User ID changed, causing all send* functions to be updated
  // - send

  // TODO: [P4] We should break this into smaller pieces using memoization function, so we don't recreate styleSet if userID is changed

  // TODO: [P3] We should think about if we allow the user to change onSendBoxValueChanged/sendBoxValue, e.g.
  // 1. Turns text into UPPERCASE
  // 2. Filter out profanity

  // TODO: [P4] Revisit all members of context
  props = patchPropsForAvatarInitials(props);

  return {
    ...props,
    ...createCardActionLogic(props),
    ...createFocusSendBoxLogic(props),
    ...createStyleSetLogic(props)
  };
}

function dispatchSetLanguageFromProps({ dispatch, locale }) {
  dispatch(setLanguage(locale));
}

function dispatchSetSendTimeoutFromProps({ dispatch, sendTimeout }) {
  dispatch(setSendTimeout(sendTimeout));
}

function dispatchSetSendTypingIndicatorFromProps({ dispatch, sendTyping, sendTypingIndicator }) {
  if (typeof sendTyping === 'undefined') {
    dispatch(setSendTypingIndicator(!!sendTypingIndicator));
  } else {
    // TODO: [P3] Take this deprecation code out when releasing on or after January 13 2020
    console.warn(
      'Web Chat: "sendTyping" has been renamed to "sendTypingIndicator". Please use "sendTypingIndicator" instead. This deprecation migration will be removed on or after January 13 2020.'
    );
    dispatch(setSendTypingIndicator(!!sendTyping));
  }
}

class Composer extends React.Component {
  constructor(props) {
    super(props);

    this.createContextFromProps = memoize(createLogic, shallowEquals);

    this.createWebSpeechPonyfill = memoize(
      (webSpeechPonyfillFactory, referenceGrammarID) =>
        webSpeechPonyfillFactory && webSpeechPonyfillFactory({ referenceGrammarID })
    );

    this.mergeContext = memoize((...contexts) => Object.assign({}, ...contexts), shallowEquals);

    this.state = {
      hoistedDispatchers: mapMap(DISPATCHERS, dispatcher => (...args) => props.dispatch(dispatcher.apply(this, args)))
    };
  }

  componentWillMount() {
    const { props } = this;
    const { directLine, userID, username } = props;

    dispatchSetLanguageFromProps(props);
    dispatchSetSendTimeoutFromProps(props);
    dispatchSetSendTypingIndicatorFromProps(props);

    props.dispatch(createConnectAction({ directLine, userID, username }));
  }

  componentDidUpdate(prevProps) {
    const { props } = this;
    const { directLine, locale, sendTimeout, sendTyping, sendTypingIndicator, userID, username } = props;

    if (prevProps.locale !== locale) {
      dispatchSetLanguageFromProps(props);
    }

    if (prevProps.sendTimeout !== sendTimeout) {
      dispatchSetSendTimeoutFromProps(props);
    }

    if (
      !prevProps.sendTypingIndicator !== !sendTypingIndicator ||
      // TODO: [P3] Take this deprecation code out when releasing on or after January 13 2020
      !prevProps.sendTyping !== !sendTyping
    ) {
      dispatchSetSendTypingIndicatorFromProps(props);
    }

    if (prevProps.directLine !== directLine || prevProps.userID !== userID || prevProps.username !== username) {
      // TODO: [P3] disconnect() is an async call (pending -> fulfilled), we need to wait, or change it to reconnect()
      props.dispatch(disconnect());
      props.dispatch(createConnectAction({ directLine, userID, username }));
    }
  }

  render() {
    const {
      props: {
        activityRenderer,
        attachmentRenderer,
        children,

        // TODO: [P2] Add disable interactivity
        disabled,

        grammars,
        groupTimestamp,
        referenceGrammarID,
        renderMarkdown,
        scrollToEnd,
        store,
        userID: _userID, // Ignoring eslint no-unused-vars: we just want to remove userID and username from propsForLogic
        username: _username, // Ignoring eslint no-unused-vars: we just want to remove userID and username from propsForLogic
        webSpeechPonyfillFactory,
        ...propsForLogic
      },
      state
    } = this;

    const contextFromProps = this.createContextFromProps(propsForLogic);

    const context = this.mergeContext(
      contextFromProps,
      state.hoistedDispatchers,

      // TODO: [P4] Should we normalize empties here? Or should we let it thru?
      //       If we let it thru, the code below become simplified and the user can plug in whatever they want for context, via Composer.props
      {
        activityRenderer,
        attachmentRenderer,
        groupTimestamp,
        disabled,
        grammars: grammars || EMPTY_ARRAY,
        renderMarkdown,
        scrollToEnd,
        store,
        webSpeechPonyfill: this.createWebSpeechPonyfill(webSpeechPonyfillFactory, referenceGrammarID)
      }
    );

    // TODO: [P3] Check how many times we do re-render context

    return (
      <Context.Provider value={context}>
        {typeof children === 'function' ? children(context) : children}
        <Dictation />
      </Context.Provider>
    );
  }
}

const ConnectedComposer = connect(({ referenceGrammarID }) => ({ referenceGrammarID }))(props => (
  <ScrollToBottomComposer>
    <ScrollToBottomFunctionContext.Consumer>
      {({ scrollToEnd }) => <Composer scrollToEnd={scrollToEnd} {...props} />}
    </ScrollToBottomFunctionContext.Consumer>
  </ScrollToBottomComposer>
));

// We will create a Redux store if it was not passed in
class ConnectedComposerWithStore extends React.Component {
  constructor(props) {
    super(props);

    this.createMemoizedStore = memoize(() => createStore());
  }

  render() {
    const { props } = this;

    return <ConnectedComposer {...props} store={props.store || this.createMemoizedStore()} />;
  }
}

export default ConnectedComposerWithStore;

// TODO: [P3] We should consider moving some props to Redux store
//       Although we use `connectToWebChat` to hide the details of accessor of Redux store,
//       we should clean up the responsibility between Context and Redux store
//       We should decide which data is needed for React but not in other environment such as CLI/VSCode

Composer.defaultProps = {
  activityRenderer: undefined,
  adaptiveCardHostConfig: undefined,
  attachmentRenderer: undefined,
  cardActionMiddleware: undefined,
  children: undefined,
  disabled: false,
  grammars: [],
  groupTimestamp: true,
  locale: window.navigator.language || 'en-US',
  referenceGrammarID: '',
  renderMarkdown: text => text,
  sendTimeout: 20000,
  sendTyping: undefined,
  sendTypingIndicator: false,
  store: undefined,
  styleOptions: {},
  userID: '',
  username: '',
  webSpeechPonyfillFactory: undefined
};

Composer.propTypes = {
  activityRenderer: PropTypes.func,
  adaptiveCardHostConfig: PropTypes.any,
  attachmentRenderer: PropTypes.func,
  cardActionMiddleware: PropTypes.func,
  children: PropTypes.any,
  directLine: PropTypes.shape({
    activity$: PropTypes.shape({
      subscribe: PropTypes.func.isRequired
    }).isRequired,
    connectionStatus$: PropTypes.shape({
      subscribe: PropTypes.func.isRequired
    }).isRequired,
    end: PropTypes.func,
    getSessionId: PropTypes.func.isRequired,
    postActivity: PropTypes.func.isRequired,
    referenceGrammarID: PropTypes.string,
    token: PropTypes.string
  }).isRequired,
  disabled: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  grammars: PropTypes.arrayOf(PropTypes.string),
  groupTimestamp: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  locale: PropTypes.string,
  referenceGrammarID: PropTypes.string,
  renderMarkdown: PropTypes.func,
  scrollToEnd: PropTypes.func.isRequired,
  sendTimeout: PropTypes.number,
  sendTyping: PropTypes.bool,
  sendTypingIndicator: PropTypes.bool,
  store: PropTypes.any,
  styleOptions: PropTypes.any,
  userID: PropTypes.string,
  username: PropTypes.string,
  webSpeechPonyfillFactory: PropTypes.func
};
