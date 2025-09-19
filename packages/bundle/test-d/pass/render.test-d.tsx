import '../setup';

import React from 'react';
import ReactDOM from 'react-dom';

import ReactWebChat, { createDirectLine } from '../../src/boot/actual/full';

const directLine = createDirectLine({ token: '...' });

ReactDOM.render(<ReactWebChat directLine={directLine} />, document.getElementById('app'));
