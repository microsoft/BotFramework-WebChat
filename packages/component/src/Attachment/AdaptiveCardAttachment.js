import memoize from 'memoize-one';
import React from 'react';

import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import Context from '../Context';

import {
  IAdaptiveCard,
  IOpenUrlAction,
  IShowCardAction,
  ISubmitAction
} from 'adaptivecards/lib/schema';

function stripSubmitAction(card) {
  if (!card.actions) {
    return card;
  }

  // Filter out HTTP action buttons
  const nextActions = card.actions
    .filter(action => action.type !== 'Action.Submit')
    .map(action =>
      action.type === 'Action.ShowCard' ?
        { ...action, card: stripSubmitAction(action.card) }
      :
        action
    );

  return { ...card, nextActions };
}

export default class AdaptiveCardAttachment extends React.Component {
  constructor(props) {
    super(props);

    this.createAdaptiveCard = memoize((adaptiveCards, content, renderMarkdown) => {
      const card = new adaptiveCards.AdaptiveCard();
      const errors = [];

      // TODO: [P3] Checks if we could make the "renderMarkdown" per card
      //       This could be limitations from Adaptive Cards package
      //       Because there could be timing difference between .parse and .render, we could be using wrong Markdown engine
      adaptiveCards.AdaptiveCard.processMarkdown = renderMarkdown || (text => text);

      // TODO: [P3] Move from "onParseError" to "card.parse(json, errors)"
      adaptiveCards.AdaptiveCard.onParseError = error => errors.push(error);

      card.parse(stripSubmitAction({
        version: '1.0',
        ...content
      }));

      adaptiveCards.AdaptiveCard.onParseError = null;

      return {
        card,
        errors
      };
    });
  }

  render() {
    const { props: { attachment } } = this;

    return (
      <Context.Consumer>
        { ({ adaptiveCards, renderMarkdown }) => {
          const { card } = this.createAdaptiveCard(adaptiveCards, attachment.content, renderMarkdown);

          return (
            <AdaptiveCardRenderer adaptiveCard={ card } />
          );
        }
      }
      </Context.Consumer>
    );
  }
}
