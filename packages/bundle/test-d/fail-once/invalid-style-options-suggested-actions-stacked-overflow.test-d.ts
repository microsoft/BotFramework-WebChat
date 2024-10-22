import { expectNotAssignable } from 'tsd';

import { createStyleSet } from '../../src/module/exports';

type CreateStyleSetInit = Parameters<typeof createStyleSet>[0];

// Related to #4081.

// Equivalent to: createStyleSet({ suggestedActionsStackedOverflow: 'string' });
expectNotAssignable<CreateStyleSetInit>({ suggestedActionsStackedOverflow: 'string' });
