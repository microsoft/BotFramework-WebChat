import { expectNotAssignable } from 'tsd';

import { createStyleSet } from '../../src/index-minimal';

type CreateStyleSetInit = Parameters<typeof createStyleSet>[0];

// "cardEmphasisBackgroundColor" is a style options only available in full bundle.

expectNotAssignable<CreateStyleSetInit>({ cardEmphasisBackgroundColor: 'orange' });

// Equivalent to: createStyleSet({ cardEmphasisBackgroundColor: 'orange' });
