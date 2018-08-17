import React from 'react';

import {
  OpenUrlAction,
  SubmitAction
} from 'adaptivecards';

import Context from '../Context';

export default ({ adaptiveCard }) =>
  <Context.Consumer>
    { ({ onOpen }) =>
      <AdaptiveCardRenderer
        adaptiveCard={ adaptiveCard }
        onOpen={ onOpen }
      />
    }
  </Context.Consumer>

class AdaptiveCardRenderer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleExecuteAction = this.handleExecuteAction.bind(this);

    this.contentRef = React.createRef();
  }

  componentDidMount() {
    this.renderCard();
  }

  componentDidUpdate() {
    this.renderCard();
  }

  handleExecuteAction(action) {
    const { props } = this;

    if (action instanceof OpenUrlAction) {
      props.onOpen(action.url);
    } else if (action instanceof SubmitAction) {
      console.warn(action);
    } else {
      console.error(`Web Chat: received unknown action from Adaptive Cards`);
      console.error(action);
    }
  }

  renderCard() {
    const { current } = this.contentRef;
    const { props: { adaptiveCard } } = this;

    if (current && adaptiveCard) {
      adaptiveCard.onExecuteAction = this.handleExecuteAction;

      const element = adaptiveCard.render();
      const [firstChild] = current.children;

      if (firstChild) {
        current.replaceChild(element, firstChild);
      } else {
        current.appendChild(element);
      }
    }
  }

  render() {
    return (
      <div ref={ this.contentRef } />
    );
  }
}
