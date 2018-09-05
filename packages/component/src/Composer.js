import { connect } from 'react-redux';
import { css } from 'glamor';
import * as AdaptiveCards from 'adaptivecards';
import memoize from 'memoize-one';
import React from 'react';
import updateIn from 'simple-update-in';

import {
  startSpeakingActivity,
  startSpeechInput,
  stopSpeakingActivity,
  stopSpeechInput
} from 'backend';

import Context from './Context';
import createStyleSet from './Styles/createStyleSet';
import debounce from './Utils/debounce';
import defaultAdaptiveCardHostConfig from './Styles/adaptiveCardHostConfig';
import mapMap from './Utils/mapMap';

// Flywheel object
const EMPTY_ARRAY = [];
const NULL_FUNCTION = () => 0;
const WEB_SPEECH_POLYFILL = {
  SpeechRecognition: window.SpeechRecognition || window.webkitSpeechRecognition,
  SpeechGrammarList: window.SpeechGrammarList || window.webkitSpeechGrammarList,
  SpeechSynthesis: window.SpeechSynthesis,
  SpeechSynthesisUtterance: window.SpeechSynthesisUtterance
};

const DEFAULT_USER_ID = 'default-user';

const DISPATCHERS = {
  startSpeakingActivity,
  startSpeechInput,
  stopSpeakingActivity,
  stopSpeechInput
};

function findLastIndex(array, predicate) {
  for (let index = array.length - 1; index >= 0; index--) {
    if (predicate.call(array, array[index])) {
      return index;
    }
  }

  return -1;
}

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

  // TODO: The user should be able to add/remove/replace the business logic layer

  // TODO: Give warnings if we are creating logic more often than we should

  // console.log('creating new logic context');

  const lang = props.lang || window.navigator.userLanguage || window.navigator.language || 'en-US';
  const postActivity = props.postActivity || (() => { throw new Error('"postActivity" is not specified in props'); });
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
          sendMessage(value);
        } else {
          throw new Error('cannot send "imBack" with a non-string value');
        }

        break;

      case 'postBack':
        postActivity({
          type: 'message',
          value,
          locale: lang
        });

        break;

      case 'call':
      case 'downloadFile':
      case 'openUrl':
      case 'playAudio':
      case 'playVideo':
      case 'showImage':
        // TODO: We should consider using <a> instead
        window.open(value);
        break;

      // case 'signin':
      //   const loginWindow = window.open();

      //   if (botConnection.getSessionId)  {
      //     botConnection.getSessionId().subscribe(sessionId => {
      //       konsole.log("received sessionId: " + sessionId);
      //       loginWindow.location.href = text + encodeURIComponent('&code_challenge=' + sessionId);
      //     }, error => {
      //       konsole.log("failed to get sessionId", error);
      //     });
      //   } else {
      //     loginWindow.location.href = text;
      //   }

      //   break;
      default:
        console.error(`Web Chat: received unknown card action "${ type }"`);
        break;
    }
  });

  const sendFiles = props.sendFiles || ((...files) => props.postActivity({
    attachments: files.map(file => ({
      contentObject: file,
      contentType: 'application/octet-stream',
      name: file.name
    })),
    channelData: {
      attachmentSizes: files.map(file => file.size)
    },
    from: {
      id: userID,
      role: 'user'
    },
    locale: lang,
    timestamp: (new Date()).toISOString(),
    type: 'message'
  }));

  const sendMessage = props.sendMessage || (text => props.postActivity({
    from: {
      id: userID,
      role: 'user'
    },
    locale: lang,
    text,
    textFormat: 'plain',
    timestamp: (new Date()).toISOString(),
    type: 'message'
  }));

  // Debounce will call a function later
  // But we need to find a way to stop debouncing, e.g.
  // 1. User type "A", then "B", then "C"
  // 2. Debouncer called
  // 3. The user press ENTER
  // 4. The bot responded
  // 5. 3 seconds later, debouncer will call sendTyping
  //    This is because the key event "C" is still pending in the debounce queue, we need to stop this call
  const sendTyping = props.sendTyping || debounce(shouldSend => shouldSend !== false && props.postActivity({
    from: {
      id: userID,
      role: 'user'
    },
    locale: lang,
    timestamp: (new Date()).toISOString(),
    type: 'typing'
  }), 3000);

  // TODO: Revisit all members of context
  return {
    ...props,

    focusSendBox,
    lang,
    onCardAction,
    postActivity,
    sendFiles,
    sendMessage,
    sendTyping,
    styleSet,
    userID
  };
}

function shallowEquals(x, y) {
  const xKeys = Object.keys(x);
  const yKeys = Object.keys(y);

  return (
    xKeys.length === yKeys.length
    && xKeys.every(key => yKeys.includes(key) && x[key] === y[key])
  );
}

class Composer extends React.Component {
  constructor(props) {
    super(props);

    this.createContextFromProps = memoize(
      createLogic,
      shallowEquals
    );

    this.mergeContext = memoize(
      (...contexts) => contexts.reduce((result, context) => Object.assign(result, context), {}),
      shallowEquals
    );

    const createActionAndDispatch = (actionFactory, args) => this.props.dispatch(actionFactory.apply(this, args));
    const hoistedDispatchers = Object.keys(DISPATCHERS).reduce((hoistedDispatchers, name) => ({
      ...hoistedDispatchers,
      [name]: createActionAndDispatch.bind(this, DISPATCHERS[name])
    }), {});

    this.state = {
      // This is for uncontrolled component
      context: {
        // Redux actions
        ...hoistedDispatchers,

        onSendBoxChange: this.handleSendBoxChange.bind(this),
        sendBoxValue: ''
      }
    };
  }

  handleSendBoxChange(nextValue) {
    this.nextSpeechState(({ context }) => ({
      context: updateIn(context, ['sendBoxValue'], () => nextValue)
    }));
  }

  render() {
    const {
      props: {
        activities,
        adaptiveCards,
        adaptiveCardHostConfig,
        children,
        grammars,
        renderMarkdown,
        scrollToBottom,
        suggestedActions,
        webSpeechPolyfill,
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
        activities: activities || EMPTY_ARRAY,
        adaptiveCards: adaptiveCards || AdaptiveCards,
        adaptiveCardHostConfig: adaptiveCardHostConfig || defaultAdaptiveCardHostConfig(this.props.styleOptions),
        grammars: grammars || EMPTY_ARRAY,
        renderMarkdown,
        scrollToBottom: scrollToBottom || NULL_FUNCTION,
        suggestedActions: suggestedActions || EMPTY_ARRAY,
        webSpeechPolyfill: webSpeechPolyfill || WEB_SPEECH_POLYFILL
      }
    );

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

export default connect(() => ({}))(Composer)
