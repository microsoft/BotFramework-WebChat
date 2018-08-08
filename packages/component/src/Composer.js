import { css } from 'glamor';
import * as AdaptiveCards from 'adaptivecards';
import memoize from 'memoize-one';
import React from 'react';
import updateIn from 'simple-update-in';

// import activities from './sampleActivities';
import Context from './Context';
import createStyleSet from './Styles/createStyleSet';
import mapMap from './Utils/mapMap';

function styleSetToClassNames(styleSet) {
  return mapMap(styleSet, (style, key) => key === 'options' ? style : css(style));
}

export default class Composer extends React.Component {
  constructor(props) {
    super(props);

    this.mergeContext = memoize(({
      staticContext,
      activities,
      adaptiveCards,
      lang,
      onOpen,
      renderMarkdown,
      scrollToBottom,
      send,
      sendBoxRef,
      styleSet,
      suggestedActions
    }) => ({
      ...staticContext,
      activities: activities || [],
      adaptiveCards: adaptiveCards || AdaptiveCards,
      focusSendBox: () => {
        const { current } = sendBoxRef || {};

        current && current.focus();
      },
      lang,
      onOpen: onOpen || window.open,
      renderMarkdown: renderMarkdown || (markdown => markdown),
      scrollToBottom: scrollToBottom || (() => 0),
      send: send || (() => 0),
      styleSet: styleSetToClassNames(styleSet),
      suggestedActions: suggestedActions || []
    }));

    this.state = {
      context: {
        // activities,
        grammars: [],
        sendBoxValue: '',
        setGrammars: memoize(grammars => this.setState(() => ({ grammars }))),
        setSendBoxValue: nextValue => this.updateContext(['sendBoxValue'], () => nextValue),
        setUserID: nextUserID => this.updateContext(['userID'], () => nextUserID),
        userID: 'default-user'
      }
    };
  }

  updateContext(path, updater) {
    this.setState(({ context }) => ({
      context: updateIn(context, path, updater)
    }));
  }

  render() {
    const {
      props: {
        activities = [],
        adaptiveCards,
        children,
        lang,
        onOpen,
        renderMarkdown,
        scrollToBottom,
        send,
        sendBoxRef,
        styleSet,
        suggestedActions = []
      },
      state: { context: staticContext }
    } = this;

    const context = this.mergeContext({
      activities,
      adaptiveCards,
      lang: lang || 'en-US',
      onOpen,
      renderMarkdown,
      scrollToBottom,
      send,
      sendBoxRef,
      staticContext,
      styleSet: styleSet || createStyleSet(),
      suggestedActions
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
