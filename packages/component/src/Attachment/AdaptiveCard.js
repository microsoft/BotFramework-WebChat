import React from 'react';

import Context from '../Context';

class AdaptiveCardContainer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.contentRef = React.createRef();
  }

  componentDidMount() {
    this.renderCard();
  }

  componentDidUpdate() {
    this.renderCard();
  }

  renderCard() {
    const { current } = this.contentRef;

    if (current) {
      const { props } = this;
      const card = new props.adaptiveCard();

      props.adaptiveCard.processMarkdown = props.renderMarkdown || (text => text);
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

export default props =>
  <Context.Consumer>
    { ({ adaptiveCard, renderMarkdown, styleSet }) =>
      <AdaptiveCardContainer
        adaptiveCard={ adaptiveCard }
        content={ props.attachment.content }
        renderMarkdown={ renderMarkdown }
      />
    }
  </Context.Consumer>
