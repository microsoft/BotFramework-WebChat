import React from 'react';
import ReactDOM from 'react-dom';

import { Components, createStore } from '../../src/boot/exports/full';

const { BasicWebChat, Composer } = Components;

const store = createStore({});

ReactDOM.render(
  <Composer directLine={undefined} store={store}>
    <BasicWebChat />
  </Composer>,
  document.getElementById('app')
);
