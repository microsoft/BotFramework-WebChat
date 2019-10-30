import { render, unmountComponentAtNode } from 'react-dom';
import React from 'react';

import ChatComponent from './ChatComponent';

function renderChatComponent(props, node) {
  render(<ChatComponent {...props} />, node);

  return () => unmountComponentAtNode(node);
}

export default renderChatComponent;
