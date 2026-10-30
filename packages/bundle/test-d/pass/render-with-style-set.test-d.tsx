import '../setup';

import React, { type ReactElement } from 'react';
import { expectAssignable } from 'tsd';

import ReactWebChat, { createDirectLine, createStyleSet } from '../../src/boot/exports/index';

const directLine = createDirectLine({ token: '...' });
const styleOptions = { accent: 'black', cardEmphasisBackgroundColor: 'orange' };
const styleSet = createStyleSet(styleOptions);

expectAssignable<ReactElement>(<ReactWebChat directLine={directLine} styleSet={styleSet} />);
