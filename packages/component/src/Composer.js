import { css } from 'glamor';
import * as AdaptiveCards from 'adaptivecards';
import memoize from 'memoize-one';
import React from 'react';
import updateIn from 'simple-update-in';

import Context from './Context';
import createStyleSet from './Styles/createStyleSet';
import mapMap from './Utils/mapMap';

function styleSetToClassNames(styleSet) {
  return mapMap(styleSet, (style, key) => key === 'options' ? style : css(style));
}

function createLogic(props) {
  // console.log('creating new context');

  const activities = props.activities || [];
  const adaptiveCards = props.adaptiveCards || AdaptiveCards;
  const grammars = props.grammars || [];
  const lang = props.lang || window.navigator.userLanguage || window.navigator.language || 'en-US';
  const onSendBoxChange = props.onSendBoxChange || (() => 0);
  const postActivity = props.postActivity || (() => { throw new Error('"postActivity" is not specified in props'); });
  const renderMarkdown = props.renderMarkdown;
  const scrollToBottom = props.scrollToBottom || (() => 0);
  const sendBoxValue = props.sendBoxValue || '';
  const styleSet = styleSetToClassNames(props.styleSet || createStyleSet());
  const suggestedActions = props.suggestedActions || [];
  const userID = props.userID || 'default-user';

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

  // TODO: Revisit all members of context
  return {
    ...props,

    activities,
    adaptiveCards,
    focusSendBox,
    grammars,
    lang,
    onCardAction,
    onSendBoxChange,
    postActivity,
    renderMarkdown,
    scrollToBottom,
    sendBoxValue,
    sendMessage,
    styleSet,
    suggestedActions,
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

export default class Composer extends React.Component {
  constructor(props) {
    super(props);

    this.createContext = memoize(createLogic, shallowEquals);

    this.state = {
      // This is for uncontrolled component
      context: {
        onSendBoxChange: nextValue => {
          this.setState(({ context }) => ({
            context: updateIn(context, ['sendBoxValue'], () => nextValue)
          }));
        },
        sendBoxValue: ''
      }
    };
  }

  render() {
    const {
      props: { children, ...otherProps },
      state
    } = this;

    const context = this.createContext({
      ...state.context,
      ...otherProps
    });

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
