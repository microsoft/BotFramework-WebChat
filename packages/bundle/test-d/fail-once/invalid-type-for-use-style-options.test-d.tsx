import '../setup';

import { expectNotAssignable } from 'tsd';

import { hooks } from '../../src/boot/exports/index';

const [_styleOptions] = hooks.useStyleOptions();

// eslint-disable-next-line no-magic-numbers
expectNotAssignable<typeof _styleOptions.cardEmphasisBackgroundColor>(123);
