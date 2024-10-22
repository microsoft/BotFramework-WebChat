import React from 'react';
import ReactDOM from 'react-dom';

import { Components, createStore } from '../../src/module/exports';

const { Composer } = Components;

const store = createStore({});

ReactDOM.render(<Composer directLine={undefined} store={store} />, document.getElementById('app'));
