import { css } from 'glamor';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

css.global('html, body, #root', { height: '100%' });
css.global('body', { margin: 0 });

ReactDOM.render(<App />, document.getElementById('root'));

registerServiceWorker();
