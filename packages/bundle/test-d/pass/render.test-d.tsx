import '../setup';

import React, { type ReactElement } from 'react';
import { expectAssignable } from 'tsd';

import ReactWebChat, { createDirectLine } from '../../src/boot/exports/index';

const directLine = createDirectLine({ token: '...' });

// Not `ReactDOM.render()`: React 19 removed it, CI also checks these with @types/react@19.
expectAssignable<ReactElement>(<ReactWebChat directLine={directLine} />);
