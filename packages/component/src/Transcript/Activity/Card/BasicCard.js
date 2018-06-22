import React from 'react';

import Bubble from './Bubble';
import Context from './Context';

export default ({ children, className }) =>
  <Context.Consumer>
    { ({ card }) =>
      <Bubble className={ className } image={ card.attachment }>
        { children(card) || <span>Unknown card</span> }
      </Bubble>
    }
  </Context.Consumer>
