import '../setup';

import { expectNotAssignable } from 'tsd';

import { createStyleSet } from '../../src/boot/actual/minimal';

type CreateStyleSetInit = Parameters<typeof createStyleSet>[0];

// "cardEmphasisBackgroundColor" is a style options only available in full bundle.

expectNotAssignable<CreateStyleSetInit>({ cardEmphasisBackgroundColor: 'orange' });

// Equivalent to: createStyleSet({ cardEmphasisBackgroundColor: 'orange' });
