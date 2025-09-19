import '../setup';

import React from 'react';
import ReactDOM from 'react-dom';

import { Components, createStore } from '../../src/boot/exports/index';

const { BasicWebChat, Composer } = Components;

const store = createStore({});

ReactDOM.render(
  <Composer directLine={undefined} store={store}>
    <BasicWebChat />
  </Composer>,
  document.getElementById('app')
);
