import { expectNotAssignable } from 'tsd';

import { hooks } from '../../src/index';

const [styleOptions] = hooks.useStyleOptions();

// eslint-disable-next-line no-magic-numbers
expectNotAssignable<typeof styleOptions.cardEmphasisBackgroundColor>(123);
