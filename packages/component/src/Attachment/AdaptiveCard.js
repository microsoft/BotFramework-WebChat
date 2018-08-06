import React from 'react';

import Context from '../Context';

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

    if (current) {
      const { props } = this;
      const card = new props.adaptiveCard();

      props.adaptiveCard.processMarkdown = props.renderMarkdown || (text => text);
      card.onExecuteAction = this.handleExecuteAction;
      card.parse(props.content);

      const element = card.render();
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
  render() {
    const { props } = this;

    return (
      <Context.Consumer>
        { ({ adaptiveCard, onOpen, renderMarkdown }) =>
          <AdaptiveCardRenderer
            adaptiveCard={ adaptiveCard }
            content={ props.attachment.content }
            onOpen={ onOpen }
            renderMarkdown={ renderMarkdown }
          />
        }
      </Context.Consumer>
    );
  }
}
