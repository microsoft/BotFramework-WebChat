import { connect } from 'react-redux';
import memoize from 'memoize-one';
import React from 'react';

import { getString } from '../Localization/String';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import Context from '../Context';
import ErrorBox from '../ErrorBox';

import {
  IAdaptiveCard,
  IOpenUrlAction,
  IShowCardAction,
  ISubmitAction
} from 'adaptivecards/lib/schema';

import { ValidationError } from 'adaptivecards/lib/enums';

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

class AdaptiveCardAttachment extends React.Component {
  constructor(props) {
    super(props);

    this.createAdaptiveCard = memoize((adaptiveCards, content, renderMarkdown) => {
      const card = new adaptiveCards.AdaptiveCard();
      const errors = [];

      // TODO: Checks if we could make the "renderMarkdown" per card
      //       Because there could be timing difference between .parse and .render, we could be using wrong Markdown engine
      adaptiveCards.AdaptiveCard.processMarkdown = renderMarkdown || (text => text);

      // TODO: Move from "onParseError" to "card.parse(json, errors)"
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
    const { props: { attachment, language }, state } = this;

    return (
      <Context.Consumer>
        { ({ adaptiveCards, renderMarkdown }) => {
          const { card, errors } = this.createAdaptiveCard(adaptiveCards, attachment.content, renderMarkdown);
          const allDeprecations = errors.every(({ error }) => error === ValidationError.Deprecated);

          return (
            errors.length && !(allDeprecations && state.ignoreDeprecations) ?
              <ErrorBox message={ getString('Adaptive Card parse error', language) }>
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

export default connect(({ settings: { language } }) => ({ language }))(AdaptiveCardAttachment)
