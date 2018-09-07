import React from 'react';

import CommonCard from './CommonCard';
import Context from '../Context';

export default ({ attachment }) =>
  <Context.Consumer>
    { ({ styleSet }) =>
      <div className={ styleSet.animationCardAttachment }>
        <CommonCard
          attachment={ attachment }
        />
      </div>
    }
  </Context.Consumer>
