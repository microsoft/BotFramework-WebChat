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
  sendPostBack,
  setDictateInterims,
  setDictateState,
  setLanguage,
  setSendBox,
  setSendTimeout,
  setSendTyping,
  startDictate,
  startSpeakingActivity,
  stopDictate,
  stopSpeakingActivity,
  submitSendBox
} from 'botframework-webchat-core';

import Context from './Context';
import createStyleSet from './Styles/createStyleSet';
import defaultAdaptiveCardHostConfig from './Styles/adaptiveCardHostConfig';
import Dictation from './Dictation';
import mapMap from './Utils/mapMap';
import shallowEquals from './Utils/shallowEquals';

// Flywheel object
const EMPTY_ARRAY = [];

const DISPATCHERS = {
  markActivity,
  postActivity,
  sendEvent,
  sendFiles,
  sendMessage,
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
  return mapMap(styleSet, (style, key) => key === 'options' ? style : css(style));
}

function createCardActionLogic({ directLine, dispatch }) {
  return {
    onCardAction: (({ type, value }) => {
      switch (type) {
        case 'imBack':
          if (typeof value === 'string') {
            // TODO: [P4] Instead of calling dispatch, we should move to dispatchers instead for completeness
            dispatch(sendMessage(value, 'imBack'));
          } else {
            throw new Error('cannot send "imBack" with a non-string value');
          }

          break;

        case 'postBack':
          dispatch(sendPostBack(value));

          break;

        case 'call':
        case 'downloadFile':
        case 'openUrl':
        case 'playAudio':
        case 'playVideo':
        case 'showImage':
          // TODO: [P3] We should support ponyfill for window.open
          //       This is as-of v3
          window.open(value);
          break;

        case 'signin':
          // TODO: [P3] We should prime the URL into the OAuthCard directly, instead of calling getSessionId on-demand
          //       This is to eliminate the delay between window.open() and location.href call

          const popup = window.open();

          if (directLine.getSessionId)  {
            const subscription = directLine.getSessionId().subscribe(sessionId => {
              popup.location.href = `${ value }${ encodeURIComponent(`&code_challenge=${ sessionId }`) }`;

              // HACK: Sometimes, the call complete asynchronously and we cannot unsubscribe
              //       Need to wait some short time here to make sure the subscription variable has setup
              setImmediate(() => subscription.unsubscribe());
            }, error => {
              // TODO: [P3] Let the user know something failed and we cannot proceed
              //       This is as-of v3 now
              console.error(error);
            });
          } else {
            popup.location.href = value;
          }

          break;

        default:
          console.error(`Web Chat: received unknown card action "${ type }"`);
          break;
      }
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

    console.warn('Web Chat: "botAvatarInitials" is deprecated. Please use "styleOptions.botAvatarInitials" instead.');
  }

  if (userAvatarInitials) {
    styleOptions = { ...styleOptions, userAvatarInitials };

    console.warn('Web Chat: "userAvatarInitials" is deprecated. Please use "styleOptions.userAvatarInitials" instead.');
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

class Composer extends React.Component {
  constructor(props) {
    super(props);

    this.createContextFromProps = memoize(
      createLogic,
      shallowEquals
    );

    this.createWebSpeechPonyfill = memoize((webSpeechPonyfillFactory, referenceGrammarID) => webSpeechPonyfillFactory && webSpeechPonyfillFactory({ referenceGrammarID }));

    this.mergeContext = memoize(
      (...contexts) => Object.assign({}, ...contexts),
      shallowEquals
    );

    this.state = {
      hoistedDispatchers: mapMap(DISPATCHERS, dispatcher => (...args) => this.props.dispatch(dispatcher.apply(this, args)))
    };
  }

  componentWillMount() {
    const { props } = this;
    const { directLine, userID } = props;

    this.setLanguageFromProps(props);
    this.setSendTimeoutFromProps(props);
    this.setSendTypingFromProps(props);

    props.dispatch(createConnectAction({ directLine, userID }));
  }

  componentDidUpdate(prevProps) {
    const { props } = this;
    const { directLine, locale, sendTimeout, sendTyping, userID } = props;

    if (prevProps.locale !== locale) {
      this.setLanguageFromProps(props);
    }

    if (prevProps.sendTimeout !== sendTimeout) {
      this.setSendTimeoutFromProps(props);
    }

    if (!prevProps.sendTyping !== !sendTyping) {
      this.setSendTypingFromProps(props);
    }

    if (
      prevProps.directLine !== directLine
      || prevProps.userID !== userID
    ) {
      // TODO: [P3] disconnect() is an async call (pending -> fulfilled), we need to wait, or change it to reconnect()
      props.dispatch(disconnect());
      props.dispatch(createConnectAction({ directLine, userID }));
    }
  }

  setLanguageFromProps(props) {
    props.dispatch(setLanguage(props.locale || window.navigator.language || 'en-US'));
  }

  setSendTimeoutFromProps(props) {
    props.dispatch(setSendTimeout(props.sendTimeout || 20000));
  }

  setSendTypingFromProps(props) {
    props.dispatch(setSendTyping(!!props.sendTyping));
  }

  render() {
    const {
      props: {
        activityRenderer,
        adaptiveCardHostConfig,
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
        userID,
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
        adaptiveCardHostConfig: adaptiveCardHostConfig || defaultAdaptiveCardHostConfig(this.props.styleOptions),
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
      <Context.Provider value={ context }>
        { typeof children === 'function' ? children(context) : children }
        <Dictation />
      </Context.Provider>
    );
  }
}

const ConnectedComposer = connect(
  ({ referenceGrammarID }) => ({ referenceGrammarID })
)(props =>
  <ScrollToBottomComposer threshold={ 40 }>
    <ScrollToBottomFunctionContext.Consumer>
      { ({ scrollToEnd }) =>
        <Composer
          scrollToEnd={ scrollToEnd }
          { ...props }
        />
      }
    </ScrollToBottomFunctionContext.Consumer>
  </ScrollToBottomComposer>
);

// We will create a Redux store if it was not passed in
class ConnectedComposerWithStore extends React.Component {
  constructor(props) {
    super(props);

    this.createMemoizedStore = memoize(() => createStore());
  }

  render() {
    const { props } = this;

    return (
      <ConnectedComposer
        { ...props }
        store={ props.store || this.createMemoizedStore() }
      />
    );
  }
}

export default ConnectedComposerWithStore

// TODO: [P3] We should consider moving some props to Redux store
//       Although we use `connectToWebChat` to hide the details of accessor of Redux store,
//       we should clean up the responsibility between Context and Redux store
//       We should decide which data is needed for React but not in other environment such as CLI/VSCode
ConnectedComposerWithStore.propTypes = {
  activityRenderer: PropTypes.func,
  adaptiveCardHostConfig: PropTypes.any,
  attachmentRenderer: PropTypes.func,
  groupTimestamp: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  disabled: PropTypes.bool,
  grammars: PropTypes.arrayOf(PropTypes.string),
  referenceGrammarID: PropTypes.string,
  renderMarkdown: PropTypes.func,
  scrollToBottom: PropTypes.func,
  sendTimeout: PropTypes.number,
  sendTyping: PropTypes.bool,
  store: PropTypes.any,
  userID: PropTypes.string,
  webSpeechPonyfillFactory: PropTypes.func
};
