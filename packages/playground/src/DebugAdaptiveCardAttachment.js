import { AdaptiveCard } from 'adaptivecards';
import { ValidationError } from 'adaptivecards/lib/enums';
import memoize from 'memoize-one';
import React from 'react';

import { ErrorBox } from 'component';

export default class DebugAdaptiveCardAttachment extends React.Component {
  constructor(props) {
    super(props);

    this.createAdaptiveCard = memoize(content => {
      const card = new AdaptiveCard();
      const errors = [];

      // TODO: Move from "onParseError" to "card.parse(json, errors)"
      AdaptiveCard.onParseError = error => errors.push(error);

      card.parse({
        version: '1.0',
        ...content
      });

      AdaptiveCard.onParseError = null;

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
    this.setState(() => ({ ignoreDeprecations: true }));
  }

  render() {
    const { props: { attachment, children }, state } = this;
    const { errors } = this.createAdaptiveCard(attachment.content);
    const allDeprecations = errors.every(({ error }) => error === ValidationError.Deprecated);

    return (
      errors.length && !(allDeprecations && state.ignoreDeprecations) ?
        <ErrorBox message="Adaptive Card parse error">
          { allDeprecations &&
            <button onClick={ this.handleIgnoreDeprecationClick }>Ignore deprecations</button>
          }
          <pre>{ JSON.stringify(errors, null, 2) }</pre>
        </ErrorBox>
      :
        children
    );
  }
}
