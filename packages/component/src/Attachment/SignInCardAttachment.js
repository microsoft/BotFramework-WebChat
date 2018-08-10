import React from 'react';

import CommonCard from './CommonCard';
import Context from '../Context';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.handleCardAction = this.handleCardAction.bind(this);
  }

  handleCardAction() {
  }

  render() {
    const { props: { attachment } } = this;

    return (
      <Context.Consumer>
        { ({ styleSet }) =>
          <div className={ styleSet.animationCardAttachment }>
            <CommonCard
              attachment={ attachment }
              onCardAction={ this.handleCardAction }
            />
          </div>
        }
      </Context.Consumer>
    );
  }
}
