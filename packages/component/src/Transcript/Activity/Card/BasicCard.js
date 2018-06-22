import React from 'react';

import Bubble from './Bubble';
import CardComposer from './Composer';
import { withCard } from './Context';

const Card = withCard(({ card, children, className }) =>
  <Bubble className={ className } image={ card.attachment }>
    { children(card) || <span>Unknown card</span> }
  </Bubble>
);

export default ({ card, children, className }) =>
  <CardComposer card={ card }>
    <Card className={ className }>
      { children }
    </Card>
  </CardComposer>
