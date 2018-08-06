import { AdaptiveCard } from 'adaptivecards';
import { css } from 'glamor';
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
      adaptiveCard,
      focusSendBox,
      lang,
      onOpen,
      renderMarkdown,
      scrollToBottom,
      send,
      styleSet,
      suggestedActions
    }) => ({
      ...staticContext,
      activities: activities || [],
      adaptiveCard: adaptiveCard || AdaptiveCard,
      focusSendBox: focusSendBox || (() => 0),
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
        adaptiveCard,
        children,
        focusSendBox,
        lang,
        onOpen,
        renderMarkdown,
        scrollToBottom,
        send,
        styleSet,
        suggestedActions = []
      },
      state: { context: staticContext }
    } = this;

    const context = this.mergeContext({
      staticContext,
      activities,
      adaptiveCard,
      focusSendBox,
      lang: lang || 'en-US',
      onOpen,
      renderMarkdown,
      scrollToBottom,
      send,
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
