import { connect } from 'react-redux';
import { css } from 'glamor';
import * as AdaptiveCards from 'adaptivecards';
import memoize from 'memoize-one';
import React from 'react';

import {
  connect as createConnectAction,
  disconnect,
  markActivity,
  postActivity,
  sendFiles,
  sendMessage,
  setLanguage,
  setSendBox,
  setSendTyping,
  startSpeakingActivity,
  startSpeechInput,
  stopSpeakingActivity,
  stopSpeechInput,
  submitSendBox
} from 'backend';

import Context from './Context';
import createStyleSet from './Styles/createStyleSet';
import defaultAdaptiveCardHostConfig from './Styles/adaptiveCardHostConfig';
import mapMap from './Utils/mapMap';
import shallowEquals from './Utils/shallowEquals';

// Flywheel object
const EMPTY_ARRAY = [];
const NULL_FUNCTION = () => ({});

const DEFAULT_USER_ID = 'default-user';

const DISPATCHERS = {
  markActivity,
  postActivity,
  sendFiles,
  sendMessage,
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

function createLogic(props) {
  // This is a heavy function, and it is expected to be only called when there is a need to recreate business logic, e.g.
  // - User ID changed, cuasing all send* functions to be updated
  // - send

  // TODO: We should break this into smaller pieces using memoization function, so we don't recreate styleSet if userID is changed

  // TODO: We should think about if we allow the user to change onSendBoxValueChanged/sendBoxValue, e.g.
  // 1. Turns text into UPPERCASE
  // 2. Filter out profanity

  // TODO: Give warnings if we are creating logic more often than we should

  const directLine = props.directLine;
  const lang = props.lang || window.navigator.userLanguage || window.navigator.language || 'en-US';
  const styleSet = styleSetToClassNames(props.styleSet || createStyleSet(props.styleOptions));

  // TODO: We should normalize props (fill-in-the-blank) before hitting this line
  const userID = props.userID || DEFAULT_USER_ID;

  const focusSendBox = props.focusSendBox || (() => {
    const { current } = props.sendBoxRef || {};

    current && current.focus();
  });

  const onCardAction = props.onCardAction || (({ type, value }) => {
    switch (type) {
      case 'imBack':
        if (typeof value === 'string') {
          // TODO: We should move to Redux action dispatchers instead
          props.dispatch(postActivity({
            from: {
              id: userID,
              role: 'user'
            },
            locale: lang,
            text: value,
            textFormat: 'plain',
            timestamp: (new Date()).toISOString(),
            type: 'message'
          }));
        } else {
          throw new Error('cannot send "imBack" with a non-string value');
        }

        break;

      case 'postBack':
        props.dispatch(postActivity({
          type: 'message',
          value,
          locale: lang
        }));

        break;

      case 'call':
      case 'downloadFile':
      case 'openUrl':
      case 'playAudio':
      case 'playVideo':
      case 'showImage':
        // TODO: We should support ponyfill for window.open
        window.open(value);
        break;

      case 'signin':
        // TODO: We should prime the URL into the OAuthCard directly, instead of calling getSessionId on-demand
        //       This is to eliminate the delay between window.open() and location.href call

        const popup = window.open();

        if (directLine.getSessionId)  {
          const subscription = directLine.getSessionId().subscribe(sessionId => {
            popup.location.href = `${ value }${ encodeURIComponent(`&code_challenge=${ sessionId }`) }`;

            // HACK: Sometimes, the call complete asynchronously and we cannot unsubscribe
            //       Need to wait some short time here to make sure the subscription variable has setup
            setImmediate(() => subscription.unsubscribe());
          }, error => {
            // TODO: Let the user know something failed and we cannot proceed
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
  });

  // TODO: Revisit all members of context
  return {
    ...props,

    focusSendBox,
    lang,
    onCardAction,
    sendFiles,
    styleSet,
    userID
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

    const hoistedDispatchers = Object.keys(DISPATCHERS).reduce((hoistedDispatchers, name) => ({
      ...hoistedDispatchers,
      [name]: (...args) => this.props.dispatch(DISPATCHERS[name].apply(this, args))
    }), {});

    this.setLanguageFromProps(props);
    this.setSendTypingFromProps(props);

    this.state = {
      // This is for uncontrolled component
      context: {
        // Redux actions
        ...hoistedDispatchers
      }
    };
  }

  componentWillMount() {
    const { props } = this;
    const { directLine, userID, username } = props;

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
      // TODO: disconnect() is an async call (pending -> fulfilled), we need to wait, or change it to reconnect()
      props.dispatch(disconnect());
      props.dispatch(createConnectAction({
        directLine,
        userID,
        username
      }));
    }

    if (prevProps) {
    }
  }

  setLanguageFromProps(props) {
    props.dispatch(setLanguage(props.locale || window.navigator.language));
  }

  setSendTypingFromProps(props) {
    props.dispatch(setSendTyping(!!props.sendTyping));
  }

  render() {
    const {
      props: {
        activityRenderer,
        adaptiveCards,
        adaptiveCardHostConfig,
        attachmentRenderer,
        botAvatarInitials,
        children,
        collapseTimestamp,

        // TODO: Add disable interactivity
        disabled,

        enableSpeech,
        grammars,
        referenceGrammarId,
        renderMarkdown,
        scrollToBottom,
        userAvatarInitials,
        webSpeechPonyfillFactory,
        ...propsForLogic
      },
      state
    } = this;

    const contextFromProps = this.createContextFromProps(propsForLogic);
    const context = this.mergeContext(
      contextFromProps,
      state.context,
      // TODO: Should we normalize empties here? Or should we let it thru?
      //       If we let it thru, the code below become simplified and the user can plug in whatever they want for context, via Composer.props
      {
        activityRenderer,
        adaptiveCards: adaptiveCards || AdaptiveCards,
        adaptiveCardHostConfig: adaptiveCardHostConfig || defaultAdaptiveCardHostConfig(this.props.styleOptions),
        attachmentRenderer,
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

    // TODO: Check how many times we do re-render context

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

// TODO: Should we hide the knowledge of Redux?
//       Everyone under this DOM tree should need access to Redux connect or dispatchers
//       All the features should be accessible via Context/Composer
export default connect(({ settings: { referenceGrammarId } }) => ({ referenceGrammarId }))(Composer)
