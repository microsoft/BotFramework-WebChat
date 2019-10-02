import React from 'react';
import ReactDOM from 'react-dom';

export default function renderWebChat(ReactWebChat, props, element) {
  ReactDOM.render(<ReactWebChat {...props} />, element);
}
