import React from 'react';
import ReactDOM from 'react-dom';

import ReactWebChat, { createDirectLine } from '../../../../lib/index';

const directLine = createDirectLine({ token: '...' });

ReactDOM.render(<ReactWebChat directLine={directLine} />, document.getElementById('app'));
