import React from 'react';
import ReactDOM from 'react-dom';

import ReactWebChat, { createDirectLine } from '../../src/boot/exports/minimal';

const directLine = createDirectLine({ token: '...' });
const styleOptions = { accent: 'black' };

ReactDOM.render(<ReactWebChat directLine={directLine} styleOptions={styleOptions} />, document.getElementById('app'));
