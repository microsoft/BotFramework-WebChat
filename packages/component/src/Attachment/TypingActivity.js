import React from 'react';

import Context from '../Context';
import TypingAnimation from './Assets/TypingAnimation';

export default props =>
  <Context.Consumer>
    { ({ styleSet }) =>
      <div className={ styleSet.typingActivity }>
        <TypingAnimation />
      </div>
    }
  </Context.Consumer>
