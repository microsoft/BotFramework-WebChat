import '../setup';

import React from 'react';
import ReactDOM from 'react-dom';

import { Components, createStore } from '../../src/boot/exports/full';

const { Composer } = Components;

const store = createStore({});

ReactDOM.render(<Composer directLine={undefined} store={store} />, document.getElementById('app'));
