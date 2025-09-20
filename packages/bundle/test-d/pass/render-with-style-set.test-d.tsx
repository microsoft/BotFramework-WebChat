import '../setup';

import React from 'react';
import ReactDOM from 'react-dom';

import ReactWebChat, { createDirectLine, createStyleSet } from '../../src/boot/exports/index';

const directLine = createDirectLine({ token: '...' });
const styleOptions = { accent: 'black', cardEmphasisBackgroundColor: 'orange' };
const styleSet = createStyleSet(styleOptions);

ReactDOM.render(<ReactWebChat directLine={directLine} styleSet={styleSet} />, document.getElementById('app'));
