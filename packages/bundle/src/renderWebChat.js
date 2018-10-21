import React from 'react';
import ReactDOM from 'react-dom';

export default function (ReactWebChat, props, element) {
  ReactDOM.render(
    <ReactWebChat { ...props } />,
    element
  );

  // TODO: [P3] Instead/In addition of exposing the store, we should expose dispatcher, e.g. `sendMessage` etc.
  //       We need to think about what is the scenario in the bundled `renderWebChat`, should the user aware of React/Redux or not
  return { store };
}
