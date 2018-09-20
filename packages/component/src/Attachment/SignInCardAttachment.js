import React from 'react';

import CommonCard from './CommonCard';
import Context from '../Context';

export default ({ adaptiveCards, attachment }) =>
  <Context.Consumer>
    { ({ styleSet }) =>
      <div className={ styleSet.animationCardAttachment }>
        <CommonCard
          adaptiveCards={ adaptiveCards }
          attachment={ attachment }
        />
      </div>
    }
  </Context.Consumer>
