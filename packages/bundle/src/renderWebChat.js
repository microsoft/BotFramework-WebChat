import React from 'react';
import ReactDOM from 'react-dom';

export default function (ReactWebChat, props, element) {
  ReactDOM.render(
    <ReactWebChat { ...props } />,
    element
  );
}
