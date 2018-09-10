import memoize from 'memoize-one';
import React from 'react';

import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import Context from '../Context';
import ErrorBox from '../ErrorBox';

import {
  IAdaptiveCard,
  IOpenUrlAction,
  IShowCardAction,
  ISubmitAction
} from 'adaptivecards/lib/schema';

function stripSubmitAction(card) {
// function cardWithoutHttpActions(card: IAdaptiveCard) {
  if (!card.actions) {
    return card;
  }

  const nextActions = card.actions.reduce((nextActions, action) => {
  // const nextActions: (IOpenUrlAction | IShowCardAction | ISubmitAction)[] = card.actions.reduce((nextActions, action) => {
    // Filter out HTTP action buttons
    switch (action.type) {
      case 'Action.Submit':
        break;

      case 'Action.ShowCard':
        nextActions.push({
          ...action,
          card: stripSubmitAction(action.card)
        });

        break;

      default:
        nextActions.push(action);

        break;
    }

    return nextActions;
  }, []);

  return { ...card, nextActions };
}

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.createAdaptiveCard = memoize((adaptiveCards, content, renderMarkdown) => {
      const card = new adaptiveCards.AdaptiveCard();

      // TODO: Checks if we could make the "renderMarkdown" per card
      //       Because there could be timing difference between .parse and .render, we could be using wrong Markdown engine
      adaptiveCards.AdaptiveCard.processMarkdown = renderMarkdown || (text => text);

      // TODO: Move from "onParseError" to "card.parse(json, errors)"
      adaptiveCards.AdaptiveCard.onParseError = error => errors.push(error);

      const errors = [];

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

    this.handleIgnoreDeprecationClick = this.handleIgnoreDeprecationClick.bind(this);

    this.state = {
      ignoreDeprecations: false
    };
  }

  handleIgnoreDeprecationClick() {
    // TODO: We need to find a way to only show deprecations in dev mode
    this.setState(() => ({ ignoreDeprecations: true }));
  }

  render() {
    const { props: { attachment }, state } = this;

    return (
      <Context.Consumer>
        { ({ adaptiveCards, renderMarkdown }) => {
          const { card, errors } = this.createAdaptiveCard(adaptiveCards, attachment.content, renderMarkdown);
          const allDeprecations = errors.every(({ error }) => error === 3);

          return (
            errors.length && !(allDeprecations && state.ignoreDeprecations) ?
              <ErrorBox message="Adaptive Card parse error">
                { allDeprecations &&
                  <button onClick={ this.handleIgnoreDeprecationClick }>Ignore deprecations</button>
                }
                <pre>{ JSON.stringify(errors, null, 2) }</pre>
              </ErrorBox>
            :
              <AdaptiveCardRenderer adaptiveCard={ card } />
          );
        }
      }
      </Context.Consumer>
    );
  }
}
