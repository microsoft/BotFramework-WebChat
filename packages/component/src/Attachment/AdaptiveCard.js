import memoize from 'memoize-one';
import React from 'react';

import Context from '../Context';

export class AdaptiveCardRenderer extends React.PureComponent {
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

    switch (action.type) {
      case 'Action.OpenUrl':
        props.onOpen(action.url);
        break;

      default:
        console.error(action);
        break;
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

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.createAdaptiveCard = memoize((adaptiveCards, content, renderMarkdown) => {
      const card = new adaptiveCards.AdaptiveCard();

      // TODO: Checks if we could make the "renderMarkdown" per card
      //       Because there could be timing difference between .parse and .render, we could be using wrong Markdown engine
      adaptiveCards.AdaptiveCard.processMarkdown = renderMarkdown || (text => text);
      card.parse(content);

      return card;
    });
  }

  render() {
    const { props } = this;

    return (
      <Context.Consumer>
        { ({ adaptiveCards, onOpen, renderMarkdown }) =>
          <AdaptiveCardRenderer
            adaptiveCard={ this.createAdaptiveCard(adaptiveCards, props.attachment.content, renderMarkdown) }
            onOpen={ onOpen }
            renderMarkdown={ renderMarkdown }
          />
        }
      </Context.Consumer>
    );
  }
}
