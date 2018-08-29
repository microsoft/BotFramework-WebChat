import React from 'react';

import Context from '../Context';
import TypingAnimation from './Assets/Typing';

export default props =>
  <Context.Consumer>
    { ({ styleSet }) =>
      <div className={ styleSet.typingActivity }>
        <TypingAnimation />
      </div>
    }
  </Context.Consumer>
