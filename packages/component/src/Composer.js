import { connect } from 'react-redux';
import { css } from 'glamor';
import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import {
  connect as createConnectAction,
  disconnect,
  markActivity,
  postActivity,
  sendFiles,
  sendMessage,
  sendPostBack,
  setLanguage,
  setSendBox,
  setSendTyping,
  startSpeakingActivity,
  startSpeechInput,
  stopSpeakingActivity,
  stopSpeechInput,
  submitSendBox
} from 'botframework-webchat-core';

import Context from './Context';
import createStyleSet from './Styles/createStyleSet';
import defaultAdaptiveCardHostConfig from './Styles/adaptiveCardHostConfig';
import mapMap from './Utils/mapMap';
import shallowEquals from './Utils/shallowEquals';

// Flywheel object
const EMPTY_ARRAY = [];
const NULL_FUNCTION = () => ({});

const DEFAULT_USER_ID = 'default-user';
const DEFAULT_USERNAME = 'user';

const DISPATCHERS = {
  markActivity,
  postActivity,
  sendFiles,
  sendMessage,
  sendPostBack,
  setSendBox,
  startSpeakingActivity,
  startSpeechInput,
  stopSpeakingActivity,
  stopSpeechInput,
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

        default:
          console.error(`Web Chat: received unknown card action "${ type }"`);
          break;
      }
    })
  };
}

function createFocusSendBoxLogic({ sendBoxRef }) {
  const focusSendBox = (() => {
    const { current } = sendBoxRef || {};

    current && current.focus();
  });

  return { focusSendBox };
}

function createStyleSetLogic({ styleSet, styleOptions }) {
  return {
    styleSet: styleSetToClassNames(styleSet || createStyleSet(styleOptions))
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

    this.createWebSpeechPonyfill = memoize((webSpeechPonyfillFactory, referenceGrammarId) => webSpeechPonyfillFactory && webSpeechPonyfillFactory({ referenceGrammarId }));

    this.mergeContext = memoize(
      (...contexts) => contexts.reduce((result, context) => Object.assign(result, context), {}),
      shallowEquals
    );

    this.state = {
      hoistedDispatchers: mapMap(DISPATCHERS, dispatcher => (...args) => this.props.dispatch(dispatcher.apply(this, args)))
    };
  }

  componentWillMount() {
    const { props } = this;
    const { directLine, userID, username } = props;

    this.setLanguageFromProps(props);
    this.setSendTypingFromProps(props);

    props.dispatch(createConnectAction({ directLine, userID, username }));
  }

  componentDidUpdate(prevProps) {
    const { props } = this;
    const { directLine, locale, sendTyping, userID, username } = props;

    if (prevProps.locale !== locale) {
      this.setLanguageFromProps(props);
    }

    if (!prevProps.sendTyping !== !sendTyping) {
      this.setSendTypingFromProps(props);
    }

    if (
      prevProps.directLine !== directLine
      || prevProps.userID !== userID
      || prevProps.username !== username
    ) {
      // TODO: [P3] disconnect() is an async call (pending -> fulfilled), we need to wait, or change it to reconnect()
      props.dispatch(disconnect());
      props.dispatch(createConnectAction({ directLine, userID, username }));
    }
  }

  setLanguageFromProps(props) {
    props.dispatch(setLanguage(props.locale || window.navigator.language || 'en-US'));
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
        botAvatarInitials,
        children,
        collapseTimestamp,

        // TODO: [P2] Add disable interactivity
        disabled,

        enableSpeech,
        grammars,
        referenceGrammarId,
        renderMarkdown,
        scrollToBottom,
        userAvatarInitials,
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

        // TODO: [P2] Move avatar initials to style options
        botAvatarInitials,
        collapseTimestamp,
        disabled,
        enableSpeech: enableSpeech !== false,
        grammars: grammars || EMPTY_ARRAY,
        renderMarkdown,
        scrollToBottom: scrollToBottom || NULL_FUNCTION,
        userAvatarInitials,
        webSpeechPonyfill: this.createWebSpeechPonyfill(webSpeechPonyfillFactory, referenceGrammarId)
      }
    );

    // TODO: [P3] Check how many times we do re-render context

    return (
      <Context.Provider value={ context }>
        {
          typeof children === 'function' ?
            <Context.Consumer>{ context => children(context) }</Context.Consumer>
          :
            children
        }
      </Context.Provider>
    );
  }
}

Composer.propTypes = {
  activityRenderer: PropTypes.func.isRequired,
  adaptiveCardHostConfig: PropTypes.any,
  attachmentRenderer: PropTypes.func.isRequired,
  botAvatarInitials: PropTypes.string,
  collapseTimestamp: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  disabled: PropTypes.bool,
  enableSpeech: PropTypes.bool,
  grammars: PropTypes.arrayOf(PropTypes.string),
  referenceGrammarId: PropTypes.string,
  renderMarkdown: PropTypes.func,
  scrollToBottom: PropTypes.func,
  userAvatarInitials: PropTypes.string,
  userID: PropTypes.string,
  webSpeechPonyfillFactory: PropTypes.func
};

Composer.defaultProps = {
  userID: DEFAULT_USER_ID,
  username: DEFAULT_USERNAME
};

// TODO: [P3] Should we hide the knowledge of Redux?
//       Everyone under this DOM tree should need access to Redux connect or dispatchers
//       All the features should be accessible via Context/Composer

// TODO: Simplify storeKey by hardcoding it
const createComposerFromStoreKey = memoize(storeKey => connect(
  ({ settings: { referenceGrammarId } }) => ({ referenceGrammarId }),
  null,
  null,
  { storeKey }
)(Composer))

export default props => React.createElement(createComposerFromStoreKey(props.storeKey), props)
