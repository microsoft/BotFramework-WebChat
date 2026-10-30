import '../setup';

import React, { type ReactElement } from 'react';
import { expectAssignable } from 'tsd';

import ReactWebChat, { createDirectLine } from '../../src/boot/exports/index';

const directLine = createDirectLine({ token: '...' });
const styleOptions = { accent: 'black', cardEmphasisBackgroundColor: 'orange' };

expectAssignable<ReactElement>(<ReactWebChat directLine={directLine} styleOptions={styleOptions} />);
