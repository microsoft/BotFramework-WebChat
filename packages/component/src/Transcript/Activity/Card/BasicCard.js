import React from 'react';

import Bubble from './Bubble';
import Context from './Context';

export default ({ children }) =>
  <Context.Consumer>
    { ({ card }) =>
      <Bubble image={ card.attachment }>
        { children(card) || <span>Unknown card</span> }
      </Bubble>
    }
  </Context.Consumer>
