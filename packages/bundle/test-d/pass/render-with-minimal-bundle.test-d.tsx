import '../setup';

import React from 'react';
import ReactDOM from 'react-dom';

import ReactWebChat, { createDirectLine } from '../../src/exports/minimal';

const directLine = createDirectLine({ token: '...' });
const styleOptions = { accent: 'black' };

ReactDOM.render(<ReactWebChat directLine={directLine} styleOptions={styleOptions} />, document.getElementById('app'));
