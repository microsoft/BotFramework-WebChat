import '../setup';

import React from 'react';
import ReactDOM from 'react-dom';

import { Components, createStore } from '../../src/boot/actual/full';

const { Composer } = Components;

const store = createStore({});

ReactDOM.render(<Composer directLine={undefined} store={store} />, document.getElementById('app'));
