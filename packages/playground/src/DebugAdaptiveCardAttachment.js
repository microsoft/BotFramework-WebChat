import { AdaptiveCard } from 'adaptivecards';
import { ValidationError } from 'adaptivecards/lib/enums';
import memoize from 'memoize-one';
import React from 'react';

import { Components } from 'botframework-webchat';

const { ErrorBox } = Components;

export default class DebugAdaptiveCardAttachment extends React.Component {
  constructor(props) {
    super(props);

    this.createAdaptiveCard = memoize(content => {
      const card = new AdaptiveCard();
      const errors = [];

      // TODO: [P3] Move from "onParseError" to "card.parse(json, errors)"
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
    const {
      props: { attachment, children },
      state: { ignoreDeprecations }
    } = this;
    const { errors } = this.createAdaptiveCard(attachment.content);
    const deprecations = errors.filter(({ error }) => error === ValidationError.Deprecated);
    const otherErrors = errors.filter(({ error }) => error !== ValidationError.Deprecated);

    return otherErrors.length ? (
      <ErrorBox message="Adaptive Card parse error">
        <pre>{JSON.stringify(otherErrors, null, 2)}</pre>
      </ErrorBox>
    ) : !ignoreDeprecations && deprecations.length ? (
      <ErrorBox message="Adaptive Card parse error">
        <button onClick={this.handleIgnoreDeprecationClick}>Ignore deprecations</button>
        <pre>{JSON.stringify(deprecations, null, 2)}</pre>
      </ErrorBox>
    ) : (
      children
    );
  }
}
