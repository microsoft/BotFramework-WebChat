import React from 'react';

import Bubble from './Bubble';
import CardComposer from './Composer';
import Context from './Context';

export default ({ card, children, className }) =>
  <CardComposer card={ card }>
    <Context.Consumer>
      { ({ card }) =>
        <Bubble className={ className } image={ card.attachment }>
          { children(card) || <span>Unknown card</span> }
        </Bubble>
      }
    </Context.Consumer>
  </CardComposer>
